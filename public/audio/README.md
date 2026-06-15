# Hero demo voice clips

Drop voice clips here to upgrade the hero "Live translation console" from the
browser's Web Speech API (robotic TTS fallback) to real, on-brand audio.

## How it works

`public/scripts/app.js` tries to play `/audio/{lang}-{index}.mp3` when each line
of the demo types out. If the file is **missing (404)**, it falls back to the
browser's text-to-speech automatically. So this folder is optional — add files
and they light up; remove them and TTS takes over. No code change needed.

The voice only plays after the visitor **taps the mic button** in the console
footer (browsers block audio autoplay until a user gesture). It starts muted.

## File naming

The index matches the phrase order in the `pairs` array in `app.js`:

| File          | Language | Phrase                              |
| ------------- | -------- | ----------------------------------- |
| `es-0.mp3`    | Spanish  | "Hola, gracias por venir hoy."      |
| `en-0.mp3`    | English  | "Hi, thanks for joining today."     |
| `es-1.mp3`    | Spanish  | "¿Arrancamos con la demo?"          |
| `en-1.mp3`    | English  | "Shall we start with the demo?"     |
| `es-2.mp3`    | Spanish  | "Me encanta trabajar con ustedes."  |
| `en-2.mp3`    | English  | "I love working with your team."    |

## Tips

- Keep each clip short (~1.5–3 s) so it lines up with the typing animation.
- `.mp3` is assumed by the code. To use another format, change the extension in
  the `speak()` function in `app.js`.
- For the "sound like you" brand promise, generate these with a quality voice
  (e.g. ElevenLabs) or record them — not the default OS TTS.
- If you add/rename/reword phrases, update both the `pairs` array in `app.js`
  and the table above.
