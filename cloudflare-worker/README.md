# TH3NOMADS Client Gallery Worker

This Worker protects private client galleries stored in the `th3nomads-client-galleries` R2 bucket.

## Cloudflare setup

1. In Cloudflare, open **Workers & Pages** and choose **Create application** > **Import a repository**.
2. Select `th3nomads/th3nomads-website`.
3. Set the root directory to `cloudflare-worker`.
4. Set the production branch to `client-gallery-prototype` while testing.
5. Deploy. The Worker name must be `th3nomads-gallery-api` to match `wrangler.jsonc`.
6. In the Worker settings, add these runtime secrets:
   - `SESSION_SECRET`: a long random value (at least 32 random bytes / 64 hex characters recommended).
   - `GALLERY_PASSWORDS`: JSON mapping gallery slugs to passwords, for example `{ "sample-gallery": "change-this-password" }`.
   - `OWNER_PASSWORD`: a separate private password the photographer uses to open any gallery without triggering client notifications.
7. Enable Cloudflare Email Service for `th3nomadsphotography.com` and confirm the `ACCESS_EMAIL` send-email binding is active. Access alerts are sent from `gallery@th3nomadsphotography.com` to `th3nomadscreate@gmail.com`.
8. Confirm the R2 binding is named `GALLERY_BUCKET` and points to `th3nomads-client-galleries`.
9. Copy the Worker `workers.dev` URL and replace the placeholder in `galleries/gallery-config.js`.

## Access notifications

- A client's first successful gallery login sends one email. The R2 marker `galleries/<slug>/.client-first-access.json` prevents duplicate first-access alerts.
- Every completed client `Download All` ZIP transfer sends an email with the file count and transferred size.
- Opening or downloading a gallery with `OWNER_PASSWORD` never sends client alerts.
- The Worker can confirm that it finished transmitting the ZIP, but a browser cannot confirm that the client retained the downloaded file.

## R2 object layout

Upload real client photos only to R2, not GitHub:

- `galleries/sample-gallery/photos/photo-01.jpg`
- `galleries/sample-gallery/photos/photo-02.jpg`
- etc.

Optional gallery metadata:

`galleries/sample-gallery/gallery.json`

```json
{
  "title": "A New Chapter",
  "subtitle": "Maternity Story"
}
```

The Worker returns short-lived signed photo URLs only after a successful gallery password login.
