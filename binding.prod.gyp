{
  'targets': [
    {
      'target_name': 'fourier-transform-native',
      'sources': [ 'workers/fourier-addon.cc' ],
       "include_dirs": [
            "/usr/local/include",
            "<!@(node -p \"require('node-addon-api').include\")"
       ],
       "libraries": [
            "-L/usr/local/lib",
            "-lfftw3"
       ],
      'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '10.7'
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 'ExceptionHandling': 1 },
      }
    }
  ]
}