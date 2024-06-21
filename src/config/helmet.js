export default {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://webembeds.com',
        'https://cdn.freecodecamp.org'
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.freecodecamp.org'
      ],
      imgSrc: ["'self'", 'data:', '*.freecodecamp.org', 'cdn.hashnode.com'],
      connectSrc: [
        "'self'",
        'https://webembeds.com',
        'https://api.spotify.com',
        'https://api.github.com',
        'https://api.twitter.com',
        'https://api.codesandbox.io',
        'https://cdn.freecodecamp.org'
      ],
      fontSrc: [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
        'https://cdn.freecodecamp.org'
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      frameSrc: [
        "'self'",
        'https://www.youtube.com',
        'https://webembeds.com',
        'https://vimeo.com',
        'https://codepen.io',
        'https://codesandbox.io',
        'https://twitter.com',
        'https://x.com',
        'https://gist.github.com',
        'https://glitch.com',
        'https://soundcloud.com',
        'https://anchor.fm',
        'https://open.spotify.com',
        'https://giphy.com',
        'https://runkit.com'
      ],
      frameAncestors: ["'self'", 'https://hashnode.com']
    }
  },
  referrerPolicy: { policy: 'no-referrer' },
  featurePolicy: {
    features: {
      fullscreen: ["'self'"],
      vibrate: ["'none'"],
      payment: ["'none'"]
    }
  }
};
