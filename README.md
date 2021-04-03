# Get Release

GitHub Action to get release

## Usage

See [action.yml](action.yml)

## Get Current Release

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

```yaml
steps:
  - uses: joutvhu/get-release@v1
    with:
      tag_name: 'v1.0.0'
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Get The Latest Release

```yaml
steps:
  - uses: joutvhu/get-release@v1
    with:
      latest: true
      # Tag name start with `v`
      pattern: v.*
      # Including pre-release
      prerelease: true
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
