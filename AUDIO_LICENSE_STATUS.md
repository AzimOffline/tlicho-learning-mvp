# Audio and content license status

## Current status: not cleared for public redistribution

The 100-record development dataset in `data/tlicho-vocabulary.json` was derived from the online Tłı̨chǫ dictionary at `https://dictionary.tlicho.biz/users/mainview.aspx`. It contains dictionary text, examples, topics, source URLs, and remote MP3 URLs. The workspace's validation report says those URLs returned valid audio when collected, but neither the dataset nor repository records a license or permission allowing republication or redistribution.

For the private development prototype, the app streams the existing remote URLs on an explicit user tap. It does not download, copy, bundle, or scrape additional recordings. This technical wiring must not be interpreted as permission to publish the audio or dictionary content.

Before any public release:

1. Confirm ownership, permitted uses, attribution requirements, and whether hotlinking is allowed with the relevant rights holder.
2. If permission is not documented, remove the remote URLs and use authorized recordings.
3. Record the license/consent and attribution for every replacement collection.

## Replacing audio

Put authorized files in `public/audio/tlicho/` and change the corresponding `audio_url` / `audio_urls` in `data/tlicho-vocabulary.json` to paths such as `/audio/tlicho/example.mp3`. Run `pnpm db:seed:tlicho` to update database references. No lesson or FSRS code needs to change.

Items with no audio remain usable: pronunciation controls are disabled and text-based multiple-choice activities continue to work.
