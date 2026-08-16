from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class StructureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "styles.css").read_text(encoding="utf-8")

    def test_story_has_six_ordered_chapters(self):
        chapters = re.findall(r'data-chapter="(p\d+)"', self.html)
        self.assertEqual(chapters, ["p1", "p2", "p3", "p4", "p7", "p8"])
        self.assertEqual(self.html.count("<h1"), 1)

    def test_supplied_headings_and_core_copy_are_present(self):
        # Default language is English; check EN copy in HTML
        rendered_text = re.sub(r"<[^>]+>", "", self.html)
        for value in [
            "A big toy that has nothing to do with AI",
            "Not a Chatbot shell!",
            "Not an emotional companion device!",
            "We don't want to make another chatbot shell",
            "Asking matters more than answering",
            "We chose image memes",
            "It will refuse to answer",
            "Earth Online",
            "Book of Questions",
            "MeMe",
        ]:
            self.assertIn(value, rendered_text)
        # ZH translations must exist in i18n.js
        i18n = (ROOT / "i18n.js").read_text(encoding="utf-8")
        for value in [
            "这是一台和 AI 没关系的大玩具",
            "我们不想再做一个套壳的 Chatbot",
            "提问比答案更重要",
            "它会拒绝回答",
            "MeMe",
            "撕掉另一半",
        ]:
            self.assertIn(value, i18n)

    def test_chapter_cue_labels_are_removed_without_removing_chapters(self):
        self.assertNotIn('class="chapter-index"', self.html)
        for cue in [
            "P1 · 开场",
            "P2 · 立场",
            "P3 · 主旨一",
            "P4 · 主旨二",
            "P7 · 升华",
            "P8 · 收尾",
        ]:
            self.assertNotIn(cue, self.html)
        chapters = re.findall(r'data-chapter="(p\d+)"', self.html)
        self.assertEqual(chapters, ["p1", "p2", "p3", "p4", "p7", "p8"])

    def test_webgl_and_fallback_hooks_exist(self):
        for needle in [
            'id="webglStage"',
            'id="webglCanvas"',
            'id="productPoster"',
            'id="storyProgress"',
            'id="webglStatus"',
            'aria-hidden="true"',
            '<script type="module" src="app.js"></script>',
        ]:
            self.assertIn(needle, self.html)

    def test_inline_favicon_avoids_static_server_404(self):
        self.assertIn('rel="icon" href="data:image/svg+xml,', self.html)

    def test_old_english_sales_copy_is_removed(self):
        for forbidden in ["ASK AGAIN", "ASK THE BOX"]:
            self.assertNotIn(forbidden, self.html)

    def test_css_defines_sticky_story_responsive_motion_and_fallback_states(self):
        for needle in [
            ".scroll-story",
            "height: 760vh",
            ".stage-root",
            "position: sticky",
            ".chapter.is-active",
            ".webgl-ready .product-poster",
            ".webgl-fallback #webglCanvas",
            "@media (max-width: 760px)",
            "@media (prefers-reduced-motion: reduce)",
            "overflow-x: clip",
            "--progress",
        ]:
            self.assertIn(needle, self.css)

    def test_app_connects_one_timeline_to_dom_and_webgl(self):
        app = (ROOT / "app.js").read_text(encoding="utf-8")
        for needle in [
            "deriveStoryState",
            "createMeScene",
            "data-chapter",
            "requestAnimationFrame",
            "--progress",
            "webgl-ready",
            "webgl-fallback",
        ]:
            self.assertIn(needle, app)

    def test_reduced_motion_removes_annotation_crossfade(self):
        self.assertIn(
            "@media (prefers-reduced-motion: reduce) {\n  .anti-labels,",
            self.css,
        )

    # --- Conversion optimization tests (SKILL.md alignment) ---

    def test_seo_meta_tags_are_present(self):
        for needle in [
            'name="description"',
            'name="keywords"',
            'property="og:type"',
            'property="og:title"',
            'name="twitter:card"',
            'rel="canonical"',
            'application/ld+json',
        ]:
            self.assertIn(needle, self.html)

    def test_hero_cta_is_above_fold(self):
        self.assertIn('class="hero-cta"', self.html)
        self.assertIn('class="hero-risk-reversal"', self.html)

    def test_chapter_ctas_exist_throughout_story(self):
        cta_count = len(re.findall(r'class="chapter-cta', self.html))
        self.assertGreaterEqual(cta_count, 3)

    def test_conversion_section_has_waitlist_form_and_faq(self):
        for needle in [
            'id="waitlist"',
            'id="reserveForm"',
            'type="email"',
            'class="faq"',
            'class="faq-item"',
            'class="social-proof"',
            'class="form-risk-reversal"',
        ]:
            self.assertIn(needle, self.html)

    def test_risk_reversal_copy_is_present(self):
        # EN copy in HTML (default), ZH copy in i18n.js
        rendered_text = re.sub(r"<[^>]+>", "", self.html)
        for value in ["No payment needed", "Unsubscribe anytime"]:
            self.assertIn(value, rendered_text)
        i18n = (ROOT / "i18n.js").read_text(encoding="utf-8")
        for value in ["无需付费", "随时退订"]:
            self.assertIn(value, i18n)

    def test_css_supports_conversion_section_and_ctas(self):
        for needle in [
            ".convert-section",
            ".hero-cta",
            ".chapter-cta",
            ".waitlist-form",
            ".form-submit",
            ".faq-item",
            ".social-proof",
        ]:
            self.assertIn(needle, self.css)


if __name__ == "__main__":
    unittest.main()
