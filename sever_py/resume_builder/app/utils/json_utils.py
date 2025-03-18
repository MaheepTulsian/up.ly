import re
import json

def extract_json_from_text(text: str) -> Dict[str, Any]:
    """Extract JSON object from text with improved error handling."""
    # Find content between triple backticks
    json_match = re.search(r"``````", text)
    if json_match:
        json_str = json_match.group(1)
    else:
        # If no backticks, try to find JSON object directly
        json_match = re.search(r"(\{[\s\S]*\})", text)
        if json_match:
            json_str = json_match.group(1)
        else:
            # If still no match, use the whole text
            json_str = text
    
    # Clean up common JSON formatting errors
    json_str = re.sub(r',(\s*[\]}])', r'\1', json_str)  # Remove trailing commas
    
    try:
        # Try to parse the JSON
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        try:
            # Try using a more lenient JSON parser as fallback
            import json5
            return json5.loads(json_str)
        except:
            # If all parsing fails, return empty dict
            return {}