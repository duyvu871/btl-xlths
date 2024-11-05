{
    "targets": [
        {
            "target_name": "fourier-transform-native",
            "sources": ["workers/fourier-addon.cc"],
            "include_dirs": [
                "workers/resources/fftw3_x64-windows/include",
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "libraries": [
                "../workers/resources/fftw3_x64-windows/lib/fftw3.lib"
            ],
            "copies": [
                {
                    "destination": "build/Release/",
                    "files": ["workers\\resources\\fftw3_x64-windows\\bin\\fftw3.dll",]
                }
            ],
            "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"],
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "msvs_settings": {
                "VCCLCompilerTool": {
                    "ExceptionHandling": 1
                },
            }
        }
    ]
}