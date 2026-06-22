# Contributing to BootForge

We love contributions! Whether you want to add a new boot animation preset, optimize the simulation player, or fix a bug in the client-side video converter, here is how you can help.

## How to Add a Presetted Boot Animation

To add your own boot animation to the showcase gallery:

1. **Upload source files**:
   - Save your `.zip` archive inside `source-zips/`.
   - The archive must have images inside parts folders (`part0`, `part1`, etc.) and a standard `desc.txt` configuration at the root.

2. **Generate previews and extracted frames**:
   - Run the local automation script in the repository root:
     ```bash
     bash gallery.sh
     ```
   - This script automatically extracts image frames, generates a web-optimized GIF preview, and updates the local data templates.

3. **Upload new assets to R2**:
   - Set up your rclone config and execute the sync pipeline:
     ```bash
     bash scripts/upload-to-r2.sh https://pub-yourbucketid.r2.dev
     ```
   - This will upload the new extracted frames and GIF preview to Cloudflare R2 and update `/src/data/animations.json` with the new CDN paths.

4. **Submit a Pull Request**:
   - Stage your modified `src/data/animations.json` preset details and push them to your fork.
   - Open a PR describing your theme.

## Code Contribution Workflow

1. Fork the repository and create your branch from `main`.
2. Install dependencies: `npm install`
3. Run in development mode: `npm run dev`
4. Ensure files format correctly: lint checks should pass cleanly.
5. Create a pull request explaining your changes.

Thanks for keeping BootForge the best boot animation toolkit on the web!
