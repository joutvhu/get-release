# Get Release

GitHub Action to get release.
Useful when you want to get upload_url of current release then upload additional assets by the [`@actions/upload-release-asset`](https://www.github.com/actions/upload-release-asset) GitHub Action.

## Usage

See [action.yml](action.yml)

# Outputs

For more information on these outputs, see the [API Documentation](https://developer.github.com/v3/repos/releases/#response-4) for an example of what these outputs look like

- `id`: The release ID
- `html_url`: The URL users can navigate to in order to view the release. ex: `https://github.com/octocat/Hello-World/releases/v1.0.0`
- `upload_url`: The URL for uploading assets to the release, which could be used by GitHub Actions for additional uses, for example the [`@actions/upload-release-asset`](https://www.github.com/actions/upload-release-asset) GitHub Action
- `tag_name`: The git tag associated with the release. ex: `v1.1.0`
- `prerelease`: Whether the release is a pre-release

## Get Current Release

If you don't specify `tag_name` and `latest` in your inputs the action will be get release of current release if available

```yaml
name: Upload Asset To Current Release
on:
  release:
    types: [created]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build project
        run: |
          zip --junk-paths my-artifact README.md

      - name: Get Current Release
        id: get_current_release
        uses: joutvhu/get-release@v1
        with:
          debug: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload Release Asset
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ steps.get_current_release.outputs.upload_url }}
          asset_path: ./my-artifact.zip
          asset_name: my-artifact.zip
          asset_content_type: application/zip
```

## Get Release By Tag Name

You can specify the exact `tag_name` of release you want to get

```yaml
steps:
  - uses: joutvhu/get-release@v1
    with:
      tag_name: v1.0.0
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Get The Latest Release

Set `latest: true` to find the latest release whose tag_name matches `pattern`.
Set `prerelease: true` to search for releases that include pre-releases.

```yaml
steps:
  - uses: joutvhu/get-release@v1
    with:
      latest: true
      # Tag name start with `v`
      pattern: '^v.*'
      # Including pre-release
      prerelease: true
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
