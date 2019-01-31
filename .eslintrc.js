module.exports = {
  "env": {
    "es6": true,
    "browser": true
  },
  "extends": [
    "airbnb",
    "plugin:react/recommended"
  ],
  "globals": {
    "module": false
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 7,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "experimentalObjectRestSpread": true,
      "modules": true
    }
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "indent": ["error", 2]
  },
  "settings": {
    "import/resolver": {
      "webpack": {
        config: 'webpack.config.js'
      }
    }
  }
}