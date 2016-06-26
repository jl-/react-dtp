import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const WEBPACK_HOST = process.env.HOST || 'localhost';
const WEBPACK_PORT = process.env.PORT || 3007;
const PATHS = {
  SRC: path.resolve(__dirname, 'src'),
  DEMO: path.resolve(__dirname, 'demo'),
  DIST: path.resolve(__dirname, 'dist'),
  LIBS: path.resolve(__dirname, 'statics', 'libs'),
  NODE_MODULES: path.resolve(__dirname, 'node_modules'),
  PUBLIC: '/'
};

const AUTOPREFIXER_CONF = [
  '{browsers:["last 5 version"]}'
].join('&');

const SASS_LOADER_CONF = [
  `includePaths[]=${PATHS.SRC}`
].join('&');

const RESOLVE = {
  extensions: ['', '.js', '.jsx', '.css', '.scss', '.json'],
  modulesDirectories: ['node_modules', 'web_modules'],
  alias: {
    libs: PATHS.LIBS
  }
};

const EXTERNALS = {
  'react': {
    root: 'React',
    commonjs2: 'react',
    commonjs: 'react',
    amd: 'react',
    umd: 'react'
  },
  'react-dom': {
    root: 'ReactDOM',
    commonjs2: 'react-dom',
    commonjs: 'react-dom',
    amd: 'react-dom',
    umd: 'react-dom'
  },
  'react-addons-transition-group': {
    root: 'ReactTransitionGroup',
    commonjs2: 'react-addons-transition-group',
    commonjs: 'react-addons-transition-group',
    amd: 'react-addons-transition-group',
    umd: 'react-addons-transition-group'
  }
};

const demo = {
  entry: {
    demo: [
      'webpack-dev-server/client?http://' + WEBPACK_HOST + ':' + WEBPACK_PORT,
      'webpack/hot/only-dev-server',
      path.resolve(PATHS.DEMO, 'index.js')
    ]
  },
  resolve: RESOLVE,
  output: {
    path: PATHS.DIST,
    filename: 'index.js',
    publicPath: PATHS.PUBLIC,
    sourceMapFilename: 'index.map.json',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['react-hot', `babel`],
      include: [PATHS.SRC, PATHS.DEMO, PATHS.DIST]
    }, {
      test: /\.(css|scss)$/,
      loader: `style!css?importLoaders=2!autoprefixer?${AUTOPREFIXER_CONF}!sass`,
        include: [PATHS.SRC, PATHS.DEMO]
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)(\?t=[0-9]+)?$/,
      loader: `url?limit=100000000`,
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      inject: 'body',
      hash: true,
      template: path.resolve(PATHS.DEMO, 'index.html'),
      title: 'Demo',
      filename: 'index.html'
    })
  ]
};

const devServerConf = {
  contentBase: PATHS.DIST,
  publicPath: '/',
  historyApiFallback: true,
  hot: true,
  stats: {
    colors: true
  }
};

const build = {
  entry: {
    src: './src/index.js'
  },
  resolve: RESOLVE,
  output: {
    path: PATHS.DIST,
    filename: 'index.js',
    publicPath: PATHS.PUBLIC,
    sourceMapFilename: 'index.map.json',
    library: 'ReactDTP',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      include: [PATHS.SRC]
    }, {
      test: /\.(css|scss)$/,
      loader: `style!css?importLoaders=2!autoprefixer?${AUTOPREFIXER_CONF}!sass`
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)(\?t=[0-9]+)?$/,
      loader: `url?limit=100000000`,
    }]
  },
  devtool: 'sourcemap',
  externals: EXTERNALS,
};

const githubPagesConf = {
  entry: {
    ghpages: [
      path.resolve(PATHS.DEMO, 'index.js')
    ]
  },
  resolve: RESOLVE,
  output: {
    path: path.resolve(PATHS.DIST, '..'),
    filename: 'index.js',
    publicPath: './',
    sourceMapFilename: 'index.map.json',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel'],
      include: [PATHS.SRC, PATHS.DEMO, PATHS.DIST]
    }, {
      test: /\.(css|scss)$/,
      loader: `style!css?importLoaders=1!sass`
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)(\?t=[0-9]+)?$/,
      loader: `url?limit=100000000`,
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'body',
      hash: false,
      template: path.resolve(PATHS.DEMO, 'index.html'),
      title: 'Demo',
      filename: 'index.html'
    })
  ]
};

export {
  PATHS, WEBPACK_HOST, WEBPACK_PORT,
  demo, devServerConf,
  build, githubPagesConf
}
