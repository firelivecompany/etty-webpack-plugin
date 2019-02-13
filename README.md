# Webpack 4+ plugin for generate `etty` translations

## Usage
1. Install
```
npm install etty-webpack-plugin
```
2. Use in `webpack.config.js`
```javascript
var EttyPlugin = require("etty-webpack-plugin").default
{
    // ...other configs
    plugins: [
        new EttyPlugin({
            // options here
        })
    ]
}
```

## Options
Name | Type | Required | Default | Description
---- | ---- | -------- | ------- | -----------
`template` | `string` | yes | - | A path to the JSON template that you are using with `etty`
`locales` | `string` | yes | - | A path to the JSON that contains locales array (`string[]`) that you are using with `etty`
`compileTo` | `string` | yes | - | A path to the folder where to place generated translations
`prefillFrom` | `string` | no | value of `compileTo` | A path to the folder where your existing translation files are placed
`logLevel` | `"all", "warning", "error", "none"` | no | `"all"` | Log level of the plugin. `"all"` will show `success`, `info`, `warning` and `error` messages; `"warning"` - `warning` and `error` messages; `"error"` only `error` messages; `"none"` will not display any messages.
`minify` | `boolean` | no | `false` | Whether to minify output JSON files or not.

## Example

Assume we have this kind of the project structure:
```
src
|- config
|- |- locales.json
|- |- template.json
translations
webpack.config.js
```

We want our translations to be generated to the `translations` folder.  
So. our `locales.json`
```json
[ "en", "de", "ru" ]
```

and our `template.json`
```json
{
    "Homepage": {
        "title": "",
        "description": ""
    }
}
```

Using `etty-webpack-plugin` in `webpack.config.js`:
```javascript
var EttyPlugin = require("etty-webpack-plugin").default

{
    // ..other configs
    plugins: [
        new EttyPlugin({
            template: "./src/config/template.json",
            locales: "./src/config/locales.json",
            compileTo: "./translations"
        })
    ]
}
```

Running `webpack` will result placing to the `translations` folder three files:
```
src
|- config
|- |- locales.json
|- |- template.json
translations
|- de.json
|- en.json
|- ru.json
webpack.config.js
```

Sample content of `en.json`:
```json
{
    "Homepage": {
        "title": "en:Homepage.title",
        "description": "en:Homepage.description"
    }
}
```

That's it!  
More detailed and fully working in real life example you can find at [etty-example](https://github.com/firelivecompany/etty-example) repo :)

## NOTE
Note, that if you want webpack to react on your `template.json` and `locale.json` changes, they obviously must be included into your application (i.e. imported somewhere of your application). If you are using `etty`, then this is not a problem for you, because you are probably already did it.

## Contributin'
Any issues, feature and pull requests are highly appreciated. Feel free to criticize and advise.