# Contributing to BootForge

We love contributions! Whether you want to add a new boot animation preset, optimize the simulation player, or fix a bug in the client-side video converter, here is how you can help.

---

## How to Add a Presetted Boot Animation

Adding a new boot animation is simple. Contributors do **not** need access to the production Cloudflare R2 bucket. Because heavy binary files (`source-zips/`, `previews/`, and `extracted/`) are excluded from Git to keep the repository lightweight, you will build and test your presets locally and submit the assets via your Pull Request description.

### Step 1: Extract & Generate Previews Locally
1. Save your custom Android boot animation `.zip` archive inside `source-zips/` (located in the project root directory).
   * Ensure it contains standard part folders (`part0`, `part1`, etc.) and a valid `desc.txt` configuration at the root.
2. Extract the animation frames and generate the web-optimized GIF preview by running the local script from the project root:
   ```bash
   bash gallery.sh
   ```
   * This automatically processes the images, creates the preview GIF, and appends a new entry to your local database index inside `/web/src/data/animations.json`.

### Step 2: Test Locally
1. Run the local Next.js development server:
   ```bash
   cd web
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser. The app will detect that R2 is not configured locally, fallback to reading your local filesystem, and let you test the animation playback simulator locally.

### Step 3: Submit Your Contribution
Since your local asset folders (`source-zips/`, `previews/`, and `extracted/`) are ignored by Git, you cannot push them directly:
1. **Commit the Index Entry**:
   * Commit and push your modified `web/src/data/animations.json` file containing the new entry details (using placeholder URLs).
2. **Submit raw assets**:
   * Open a Pull Request (PR) on GitHub.
   * **For 1-2 animations**: Drag-and-drop the raw `.zip` and `.gif` files directly into the GitHub PR description box as attachments.
   * **For bulk contributions (e.g. 5+ animations)**: Upload a zip of your previews and source archives to a file-sharing service (like Google Drive, Mega, or Dropbox) and paste the share link in the PR description.
3. **Maintainer Sync**:
   * The project maintainer will verify your PR locally. If accepted, they will download your assets, run the sync script (`bash scripts/upload-to-r2.sh`) to upload the assets to the official Cloudflare R2 bucket, and merge your PR into production!

---

## Code Contribution Workflow

1. Fork the repository and create your branch from `main`.
2. Install dependencies: `npm install`
3. Run in development mode: `npm run dev`
4. Ensure files format correctly: lint checks should pass cleanly.
5. Create a pull request explaining your changes.

Thanks for keeping BootForge the best boot animation toolkit on the web!
