Generate today's family news briefing. Follow these steps exactly:

1. Read `prompts/briefing-prompt.md` for the full template, audience, tone, and format instructions.
2. Research today's news using WebSearch — run 5-6 searches covering: international news, world politics, financial/stock market news, technology/AI news, and gaming/strategy game news.
3. Write the briefing script to `scripts/$CURRENT_DATE.md` following the template format (~750 words, 5 sections plus closing quote).
4. Run the TTS conversion: `npx tsx src/tts.ts scripts/$CURRENT_DATE.md`
5. Confirm the MP3 was saved to `output/$CURRENT_DATE.mp3` with file size.
6. Publish to podcast feed: `npx tsx src/publish.ts` — this copies MP3s to docs/audio/, rebuilds feed.xml, and pushes docs/ to the public GitHub Pages repo.
7. **Always** commit and push source to the private repo — do not stop or ask for confirmation: `git add scripts/$CURRENT_DATE.md && git commit -m "Add briefing for $CURRENT_DATE" && git push origin main`
8. Confirm the feed is live with the new episode. Remind the user that Alexa may take a minute or two to refresh its cache.
