"""
DairyPulse Intelligent Route Optimization Service
Applies Nearest-Neighbor and 2-Opt Heuristics to solve the Traveling Salesperson
Problem (TSP) across customer doorstep coordinates.
"""
import math
from typing import List, Dict, Any, Tuple

# Earth radius in kilometers
R_EARTH = 6371.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS points in kilometers."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 2.0  # Default reasonable city distance in km if missing GPS
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R_EARTH * c, 3)

def total_tour_distance(tour: List[Dict[str, Any]], depot: Tuple[float, float]) -> float:
    """Calculates total distance from depot through all stops and back."""
    if not tour:
        return 0.0
    dist = 0.0
    curr_lat, curr_lon = depot
    for stop in tour:
        stop_lat = stop.get("latitude")
        stop_lon = stop.get("longitude")
        dist += haversine_distance(curr_lat, curr_lon, stop_lat, stop_lon)
        if stop_lat is not None and stop_lon is not None:
            curr_lat, curr_lon = stop_lat, stop_lon
    # Return to depot
    dist += haversine_distance(curr_lat, curr_lon, depot[0], depot[1])
    return round(dist, 2)

def optimize_stops_tsp(
    stops: List[Dict[str, Any]],
    depot_lat: float = 18.5590,
    depot_lon: float = 73.7868
) -> Dict[str, Any]:
    """
    Optimizes the delivery stops sequence using:
    1. Greedy Nearest-Neighbor Initialization
    2. 2-Opt Edge-Exchange Local Search for untangling loops
    """
    if not stops:
        return {
            "original_distance_km": 0.0,
            "optimized_distance_km": 0.0,
            "distance_saved_km": 0.0,
            "original_time_mins": 0,
            "optimized_time_mins": 0,
            "time_saved_mins": 0,
            "fuel_saved_liters": 0.0,
            "optimized_stops": [],
        }

    depot = (depot_lat, depot_lon)
    original_dist = total_tour_distance(stops, depot)

    # 1. Greedy Nearest-Neighbor Construction
    unvisited = list(stops)
    tour = []
    curr_lat, curr_lon = depot

    while unvisited:
        best_idx = 0
        best_dist = float("inf")
        for i, stop in enumerate(unvisited):
            d = haversine_distance(curr_lat, curr_lon, stop.get("latitude"), stop.get("longitude"))
            if d < best_dist:
                best_dist = d
                best_idx = i

        chosen = unvisited.pop(best_idx)
        tour.append(chosen)
        if chosen.get("latitude") is not None and chosen.get("longitude") is not None:
            curr_lat = chosen["latitude"]
            curr_lon = chosen["longitude"]

    # 2. 2-Opt Local Search Improvement
    n = len(tour)
    improved = True
    iterations = 0
    max_iterations = 50

    while improved and iterations < max_iterations:
        improved = False
        iterations += 1
        best_current_dist = total_tour_distance(tour, depot)

        for i in range(n - 1):
            for j in range(i + 1, n):
                # 2-opt swap: reverse the subsegment from i to j
                new_tour = tour[:i] + tour[i:j + 1][::-1] + tour[j + 1:]
                new_dist = total_tour_distance(new_tour, depot)
                if new_dist < best_current_dist - 0.05:
                    tour = new_tour
                    best_current_dist = new_dist
                    improved = True
                    break
            if improved:
                break

    optimized_dist = total_tour_distance(tour, depot)
    if optimized_dist > original_dist:
        # Fall back to original if already optimal
        tour = stops
        optimized_dist = original_dist

    dist_saved = round(max(0.0, original_dist - optimized_dist), 2)
    # Average speed in early morning residential delivery is ~22 km/h + 2 mins per drop
    orig_time = int(round((original_dist / 22.0) * 60 + len(stops) * 2.5))
    opt_time = int(round((optimized_dist / 22.0) * 60 + len(stops) * 2.5))
    time_saved = max(0, orig_time - opt_time)
    fuel_saved = round(dist_saved * 0.12, 2)  # ~0.12 L/km motorbike/small van consumption

    # Assign new sequence numbers
    for idx, stop in enumerate(tour):
        stop["sequence_order"] = idx + 1

    return {
        "original_distance_km": original_dist,
        "optimized_distance_km": optimized_dist,
        "distance_saved_km": dist_saved,
        "original_time_mins": orig_time,
        "optimized_time_mins": opt_time,
        "time_saved_mins": time_saved,
        "fuel_saved_liters": fuel_saved,
        "optimized_stops": tour,
    }
