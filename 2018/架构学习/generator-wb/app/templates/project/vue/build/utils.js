"use strict";
const glob = require("glob");
const path = require("path");
const config = require("../config");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const packageConfig = require("../package.json");
// 页面模板
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 取得相应的页面路径，因为之前的配置，所以是src文件夹下的pages文件夹
const PAGE_PATH = path.resolve(__dirname, "../src/pages");
// 用于做相应的merge处理
const merge = require("webpack-merge");

exports.assetsPath = function(_path) {
  const assetsSubDirectory =
    process.env.NODE_ENV === "production"
      ? config.build.assetsSubDirectory
      : config.dev.assetsSubDirectory;

  return path.posix.join(assetsSubDirectory, _path);
};

exports.cssLoaders = function(options) {
  options = options || {};

  const cssLoader = {
    loader: "css-loader",
    options: {
      sourceMap: options.sourceMap
    }
  };

  const postcssLoader = {
    loader: "postcss-loader",
    options: {
      sourceMap: options.sourceMap
    }
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = options.usePostCSS
      ? [cssLoader, postcssLoader]
      : [cssLoader];

    if (loader) {
      loaders.push({
        loader: loader + "-loader",
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      });
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: "vue-style-loader",
        publicPath: "../../"
      });
    } else {
      return ["vue-style-loader"].concat(loaders);
    }
  }

  function generateSassResourceLoader() {
    //新增的sass引入资源
    var loaders = [
      cssLoader,
      "sass-loader",
      {
        loader: "sass-resources-loader",
        options: {
          resources: [path.resolve(__dirname, "../src/common/style/mixin.scss")]
        }
      }
    ];
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: "vue-style-loader"
      });
    } else {
      return ["vue-style-loader"].concat(loaders);
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders("less"),
    sass: generateSassResourceLoader(),
    scss: generateSassResourceLoader(),
    stylus: generateLoaders("stylus"),
    styl: generateLoaders("stylus")
  };
};

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function(options) {
  const output = [];
  const loaders = exports.cssLoaders(options);

  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp("\\." + extension + "$"),
      use: loader
    });
  }

  return output;
};

exports.createNotifierCallback = () => {
  const notifier = require("node-notifier");

  return (severity, errors) => {
    if (severity !== "error") return;

    const error = errors[0];
    const filename = error.file && error.file.split("!").pop();

    notifier.notify({
      title: packageConfig.name,
      message: severity + ": " + error.name,
      subtitle: filename || "",
      icon: path.join(__dirname, "logo.png")
    });
  };
};

// 获取入口文件
exports.entries = function() {
  let entryFiles = glob.sync(PAGE_PATH + "/*/*.js");
  let map = {};
  entryFiles.forEach(filePath => {
    let filename = filePath.substring(
      filePath.lastIndexOf("/") + 1,
      filePath.lastIndexOf(".")
    );
    map[filename] = filePath;
  });
  return map;
};
// 多页面配置
exports.htmlPlugin = function() {
  let entryHtml = glob.sync(PAGE_PATH + "/*/*.html");
  let arr = [];
  entryHtml.forEach(filePath => {
    let filename = filePath.substring(
      filePath.lastIndexOf("/") + 1,
      filePath.lastIndexOf(".")
    );
    let conf = {
      // 模板来源
      template: filePath,
      // 文件名称
      filename: filename + ".html",
      // 页面模板需要加对应的js脚本，如果不加这行则每个页面都会引入所有的js脚本
      chunks: ["manifest", "vendor", filename],
      inject: true
    };
    if (process.env.NODE_ENV === "production") {
      conf = merge(conf, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        },
        chunksSortMode: "dependency"
      });
    }
    arr.push(new HtmlWebpackPlugin(conf));
  });
  return arr;
};
