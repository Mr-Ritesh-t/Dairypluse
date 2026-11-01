import re
from typing import List

def get_phone_search_patterns(phone_or_id: str) -> List[str]:
    """
    Generate all standard Indian phone number variations for flexible lookup.
    
    Handles:
    - 10-digit formats (9876543210, +919876543210, +91 9876543210, 09876543210)
    - 12-digit international format with prefix (919876543210, +919876543210)
    - 11-digit leading zero format (09876543210)
    
    Returns deduplicated list of search strings preserving insertion order.
    """
    if not phone_or_id:
        return []
    raw = str(phone_or_id).strip()
    digits = re.sub(r"\D", "", raw)
    patterns = [raw]
    if not digits:
        return patterns

    if len(digits) == 10:
        patterns.extend([
            digits,
            f"+91{digits}",
            f"+91 {digits}",
            f"91{digits}",
            f"0{digits}",
            f"{digits[:5]} {digits[5:]}",
            f"+91 {digits[:5]} {digits[5:]}",
        ])
    elif len(digits) == 12 and digits.startswith("91"):
        d10 = digits[2:]
        patterns.extend([
            d10,
            f"+{digits}",
            digits,
            f"+91 {d10}",
            f"0{d10}",
            f"{d10[:5]} {d10[5:]}",
            f"+91 {d10[:5]} {d10[5:]}",
        ])
    elif len(digits) == 11 and digits.startswith("0"):
        d10 = digits[1:]
        patterns.extend([
            d10,
            f"+91{d10}",
            f"+91 {d10}",
            f"91{d10}",
            digits,
            f"{d10[:5]} {d10[5:]}",
            f"+91 {d10[:5]} {d10[5:]}",
        ])
    else:
        patterns.append(digits)

    # Return deduplicated list preserving order
    return list(dict.fromkeys(patterns))
