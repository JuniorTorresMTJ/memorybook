"""
Iterative Fix Agent

Creates repair prompts for images that failed validation.
"""

from typing import Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.review import ImageQCResult
from models.prompts import PromptItem
from models.visual import VisualFingerprint
from prompts.master_prompts import ITERATIVE_FIX_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class IterativeFixAgent(AgentBase[Tuple[PromptItem, ImageQCResult, VisualFingerprint, str], PromptItem]):
    """
    Agent responsible for creating repair prompts.
    
    Takes a failed image and its QC results to create an
    improved prompt that addresses the identified issues.
    """
    
    # Use fast model for iterative fixes
    MODEL = "gemini-2.0-flash"

    async def run(self, input_data: Tuple[PromptItem, ImageQCResult, VisualFingerprint, str]) -> PromptItem:
        """
        Create a repair prompt for a failed image.
        
        Args:
            input_data: Tuple of (original PromptItem, ImageQCResult, VisualFingerprint, user_language)
            
        Returns:
            Improved PromptItem for regeneration
        """
        # Handle both old and new format
        if len(input_data) == 3:
            original_prompt, qc_result, fingerprint = input_data
            user_language = "en-US"
        else:
            original_prompt, qc_result, fingerprint, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Creating repair prompt for page {original_prompt.page_number} (language: {user_language})")
        
        # Build system prompt with language
        system_prompt = build_prompt(ITERATIVE_FIX_PROMPT, user_language)
        user_prompt = self._build_fix_prompt(original_prompt, qc_result, fingerprint, user_language)
        
        try:
            result = await self.gemini.revise_text(
                prompt=f"{system_prompt}\n\n{user_prompt}",
                schema=PromptItem
            )
            
            fixed_prompt = PromptItem(**result)
            fixed_prompt.page_number = original_prompt.page_number
            fixed_prompt.prompt_type = original_prompt.prompt_type
            fixed_prompt.version = original_prompt.version + 1
            fixed_prompt.revision_notes = [
                f"Fixed issues: {', '.join(qc_result.issues_found)}",
                f"Applied suggestions: {', '.join(qc_result.suggestions)}"
            ]
            
            self._log_info(f"Repair prompt created for page {original_prompt.page_number}")
            return fixed_prompt
            
        except Exception as e:
            self._log_error(f"Failed to create repair prompt: {str(e)}")
            return self._create_manual_fix(original_prompt, qc_result, fingerprint, user_language)
    
    def _build_fix_prompt(self, original: PromptItem, qc_result: ImageQCResult, 
                         fingerprint: VisualFingerprint, user_language: str) -> str:
        """Build the prompt for creating a fix."""
        character_desc = fingerprint.get_prompt_description()
        
        parts = [
            f"User Language: {user_language}",
            "Create an improved version of this prompt to fix identified issues.",
            "",
            "=== ORIGINAL PROMPT ===",
            f"Main Prompt: {original.main_prompt}",
            f"Character: {original.character_description}",
            f"Scene: {original.scene_description}",
            f"Style: {original.style_prompt}",
            f"Negative: {', '.join(original.negative_constraints)}",
            "",
            "=== QC RESULTS ===",
            f"Passed: {qc_result.passed}",
            f"Overall Score: {qc_result.metrics.overall_score}/10",
            f"Character Accuracy: {qc_result.metrics.character_accuracy}/10",
            f"Style Consistency: {qc_result.metrics.style_consistency}/10",
            "",
            "Issues Found:",
        ]
        
        for issue in qc_result.issues_found:
            parts.append(f"  - {issue}")
        
        parts.extend([
            "",
            "Suggestions:",
        ])
        
        for suggestion in qc_result.suggestions:
            parts.append(f"  - {suggestion}")
        
        parts.extend([
            "",
            "=== CORRECT CHARACTER DESCRIPTION ===",
            character_desc,
            "",
            "=== TASK ===",
            f"IMPORTANT: All fix_focus, preserved_elements, and revision_notes MUST be in {user_language}.",
            "",
            "Create an improved prompt that:",
            "1. Addresses all identified issues",
            "2. Strengthens character description accuracy",
            "3. Adds negative constraints to prevent the issues",
            "4. Maintains the original scene and emotional intent",
            "5. Preserves everything that was already correct",
            "6. CRITICAL: The image must contain absolutely NO text, letters, words, numbers, signs, captions, or typography of any kind. AI-generated text is always misspelled and garbled. The image must be purely visual."
        ])
        
        return "\n".join(parts)
    
    def _create_manual_fix(self, original: PromptItem, qc_result: ImageQCResult, 
                          fingerprint: VisualFingerprint, user_language: str) -> PromptItem:
        """Create a manual fix when Gemini fails."""
        character_desc = fingerprint.get_prompt_description()
        
        # Strengthen the prompt based on issues
        enhanced_prompt = original.main_prompt
        
        # Add character description emphasis
        if qc_result.metrics.character_accuracy < 7:
            enhanced_prompt = f"IMPORTANT: {character_desc}. {enhanced_prompt}"
        
        # Add style emphasis
        if qc_result.metrics.style_consistency < 7:
            enhanced_prompt = f"{enhanced_prompt}. Strictly follow the specified illustration style."
        
        # Add issues as negative constraints
        new_negatives = list(original.negative_constraints)
        for issue in qc_result.issues_found:
            # Convert issue to negative constraint
            if "wrong" in issue.lower():
                new_negatives.append(issue.lower().replace("wrong", "").strip())
            elif "missing" in issue.lower():
                pass  # Can't add missing things as negatives
            else:
                new_negatives.append(issue.lower())
        
        # Language-specific notes
        notes = {
            "pt-BR": ["Correção manual aplicada", f"Problemas corrigidos: {', '.join(qc_result.issues_found)}"],
            "en-US": ["Manual fix applied", f"Issues addressed: {', '.join(qc_result.issues_found)}"],
            "es-ES": ["Corrección manual aplicada", f"Problemas corregidos: {', '.join(qc_result.issues_found)}"]
        }
        
        revision_notes = notes.get(user_language, notes["en-US"])
        
        return PromptItem(
            page_number=original.page_number,
            prompt_type=original.prompt_type,
            main_prompt=enhanced_prompt,
            character_description=character_desc,  # Use fingerprint description
            scene_description=original.scene_description,
            style_prompt=original.style_prompt,
            negative_constraints=list(set(new_negatives)),  # Deduplicate
            render_params=original.render_params,
            reference_image_paths=original.reference_image_paths,
            revision_notes=revision_notes,
            version=original.version + 1
        )
