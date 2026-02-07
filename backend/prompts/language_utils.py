"""
Language Utilities

Functions for normalizing and handling user language preferences.
"""

from typing import Dict

# Language normalization mapping
LANGUAGE_MAP: Dict[str, str] = {
    # Portuguese
    "pt": "pt-BR",
    "pt-br": "pt-BR",
    "pt-BR": "pt-BR",
    "pt_BR": "pt-BR",
    "portuguese": "pt-BR",
    "portugues": "pt-BR",
    "português": "pt-BR",
    "brazil": "pt-BR",
    "brazilian": "pt-BR",
    
    # English
    "en": "en-US",
    "en-us": "en-US",
    "en-US": "en-US",
    "en_US": "en-US",
    "en-gb": "en-GB",
    "en-GB": "en-GB",
    "english": "en-US",
    "american": "en-US",
    "british": "en-GB",
    
    # Spanish
    "es": "es-ES",
    "es-es": "es-ES",
    "es-ES": "es-ES",
    "es_ES": "es-ES",
    "es-mx": "es-MX",
    "es-MX": "es-MX",
    "spanish": "es-ES",
    "español": "es-ES",
    "espanol": "es-ES",
    
    # French
    "fr": "fr-FR",
    "fr-fr": "fr-FR",
    "fr-FR": "fr-FR",
    "french": "fr-FR",
    "français": "fr-FR",
    "francais": "fr-FR",
    
    # German
    "de": "de-DE",
    "de-de": "de-DE",
    "de-DE": "de-DE",
    "german": "de-DE",
    "deutsch": "de-DE",
    
    # Italian
    "it": "it-IT",
    "it-it": "it-IT",
    "it-IT": "it-IT",
    "italian": "it-IT",
    "italiano": "it-IT",
}

# Language display names
LANGUAGE_NAMES: Dict[str, str] = {
    "pt-BR": "Portuguese (Brazil)",
    "en-US": "English (United States)",
    "en-GB": "English (United Kingdom)",
    "es-ES": "Spanish (Spain)",
    "es-MX": "Spanish (Mexico)",
    "fr-FR": "French (France)",
    "de-DE": "German (Germany)",
    "it-IT": "Italian (Italy)",
}


def resolve_language(user_language: str) -> str:
    """
    Normalize language codes to standard format.
    
    Args:
        user_language: User-provided language code or name
        
    Returns:
        Normalized language code (e.g., "pt-BR", "en-US")
        
    Examples:
        >>> resolve_language("pt")
        "pt-BR"
        >>> resolve_language("portuguese")
        "pt-BR"
        >>> resolve_language("en-US")
        "en-US"
        >>> resolve_language("english")
        "en-US"
    """
    if not user_language:
        return "en-US"  # Default to English
    
    # Clean input
    cleaned = user_language.strip().lower()
    
    # Check if it's already normalized (case-insensitive lookup)
    for key, value in LANGUAGE_MAP.items():
        if key.lower() == cleaned:
            return value
    
    # If not found, try to match the first two characters
    if len(cleaned) >= 2:
        prefix = cleaned[:2]
        for key, value in LANGUAGE_MAP.items():
            if key.lower().startswith(prefix):
                return value
    
    # Default to English if no match
    return "en-US"


def get_language_instruction(user_language: str) -> str:
    """
    Generate the language instruction block for prompts.
    
    Args:
        user_language: Normalized language code
        
    Returns:
        Instruction string for the prompt
    """
    lang = resolve_language(user_language)
    lang_name = LANGUAGE_NAMES.get(lang, lang)
    
    return f"""
LANGUAGE REQUIREMENTS:
- User language: {lang} ({lang_name})
- ALL user-facing text (titles, descriptions, scenes, feedback) MUST be written in {lang_name}
- Technical field names, JSON keys, and identifiers remain in English
- NEVER mix languages in user-facing content
- If unsure about a term, use the {lang_name} equivalent
"""


def get_language_examples(user_language: str) -> Dict[str, str]:
    """
    Get example translations for common terms.
    
    Args:
        user_language: Normalized language code
        
    Returns:
        Dictionary of example translations
    """
    lang = resolve_language(user_language)
    
    examples = {
        "pt-BR": {
            "childhood": "infância",
            "adolescence": "adolescência",
            "adulthood": "vida adulta",
            "later_life": "terceira idade",
            "joy": "alegria",
            "love": "amor",
            "family": "família",
            "memory": "memória",
            "cover": "capa",
            "back_cover": "contracapa",
        },
        "en-US": {
            "childhood": "childhood",
            "adolescence": "adolescence",
            "adulthood": "adulthood",
            "later_life": "later life",
            "joy": "joy",
            "love": "love",
            "family": "family",
            "memory": "memory",
            "cover": "cover",
            "back_cover": "back cover",
        },
        "es-ES": {
            "childhood": "infancia",
            "adolescence": "adolescencia",
            "adulthood": "edad adulta",
            "later_life": "tercera edad",
            "joy": "alegría",
            "love": "amor",
            "family": "familia",
            "memory": "memoria",
            "cover": "portada",
            "back_cover": "contraportada",
        },
    }
    
    return examples.get(lang, examples["en-US"])
