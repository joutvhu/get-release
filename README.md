# Get Release

GitHub Action to get release

## Usage

See [action.yml](action.yml)

## Get Current Release

```yaml
name: Get Current Release
on:
  release:
    types: [created]
jobs:
  test:
    steps:
      - uses: joutvhu/get-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
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
