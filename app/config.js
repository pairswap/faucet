module.exports = {
  tokenInfos: {
    TIGER: {
      'polygon-testnet': '0xE5216E1f485A209aaf5D8FfD36E9e499f1FDDFA9',
      'binance-testnet': '0xEae73C6e2eD79231A238230a2a1967e96aE2708b',
      'fantom-testnet': '0x8E00081e4A6F68e554b470908c4f6758bEc144d2',
      'avaxc-testnet': '0x7a23568c583483e9f7e13ae34a533a01d76213b9',
      'solana-devnet': 'AJdUMt177iQ19J63ybkXtUVD6sK8dxD5ibietQANuv9S',
    },
    KANGAROO: {
      'polygon-testnet': '0x85463E352D14C9087c69cd700322554E5C06831b',
      'binance-testnet': '0x0415c3F9078525CF448b647D1f4370c81968a38c',
      'fantom-testnet': '0xcb96eBFB38E8E6f998f981f864666C608fa2Eea6',
      'avaxc-testnet': '0xd876383cda551b5d6159f0fa7805b04db1eaaf57',
      'solana-devnet': 'AJdUMt177iQ19J63ybkXtUVD6sK8dxD5ibietQANuv9S',
    },
    MOUSE: {
      'polygon-testnet': '0xC392c9239Da4079C777cf9074e42543EB47a6545',
      'binance-testnet': '0x1ee9A5D2546718958d2E3F5A252E320F03621dfE',
      'fantom-testnet': '0xD47AF82eb8B7209cc2dAcE94856D83492b9ed0FE',
      'avaxc-testnet': '0x1537ed04fa536d2098cc4e319df5218df442f188',
      'solana-devnet': 'AJdUMt177iQ19J63ybkXtUVD6sK8dxD5ibietQANuv9S',
    },
    MONKEY: {
      'polygon-testnet': '0xfeF1B365e7b4260406421c29b5F4C4C8621473d1',
      'binance-testnet': '0x64E668B1AE7f67858d270879d5a6dC9d86e6e162',
      'fantom-testnet': '0x7a31ac89BCDeb78A1De360a87E8041B48b5C3490',
      'avaxc-testnet': '0x6fd1d4a852946e6526dede229961e4fda4dc7b5b',
      'solana-devnet': 'AJdUMt177iQ19J63ybkXtUVD6sK8dxD5ibietQANuv9S',
    },
    BUNNY: {
      'polygon-testnet': '0x3a216D9f8E39349e30c9E5619c38AdDb43bAf70c',
      'binance-testnet': '0x8d39809294C4130b1A5Bf0476601b6912D57aBA4',
      'fantom-testnet': '0x3f58cE2EFB053CbA709CE526e01A727513Ab985c',
      'avaxc-testnet': '0x8ea0442d850b9ed11264f16a05507bce11dc8fba',
      'solana-devnet': 'AJdUMt177iQ19J63ybkXtUVD6sK8dxD5ibietQANuv9S',
    },
  },
  chainInfos: {
    'polygon-testnet': {
      chainId: 80001,
      rpcUrl: 'https://rpc.ankr.com/polygon_mumbai',
    },
    'binance-testnet': {
      chainId: 97,
      rpcUrl: 'https://data-seed-prebsc-1-s3.binance.org:8545',
    },
    'fantom-testnet': {
      chainId: 4002,
      rpcUrl: 'https://rpc.testnet.fantom.network',
    },
    'avaxc-testnet': {
      chainId: 43113,
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    },
    'solana-devnet': {},
  },
  queueSize: 5,
  maxToken: '50.0',
  tokenPerRequest: '25.0',
};
