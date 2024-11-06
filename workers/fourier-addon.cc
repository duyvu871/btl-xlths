#include <napi.h>
#include <vector>
#include <complex>
#include <fftw3.h>

using namespace Napi;

Napi::Array processPrices(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Array result; // Declare result here

    try {
        if (info.Length() < 1) {
            throw Napi::TypeError::New(env, "Wrong number of arguments"); // Throw error
        }

        if (!info[0].IsArray()) {
            throw Napi::TypeError::New(env, "Expected an array of numbers");
        }

        Napi::Array prices_BTC_js = info[0].As<Napi::Array>();
        size_t n = prices_BTC_js.Length();

        std::vector<double> prices_BTC(n);
        for (size_t i = 0; i < n; i++) {
            Napi::Value val = prices_BTC_js[i];
            if (!val.IsNumber()) {
                throw Napi::TypeError::New(env, "Array elements must be numbers");
            }
            prices_BTC[i] = val.As<Napi::Number>().DoubleValue();
        }

        int N = prices_BTC.size();
        std::vector<std::complex<double>> fft_coefs(N);
        std::vector<double> fft_prices(N);

        fftw_plan plan = fftw_plan_dft_r2c_1d(N, prices_BTC.data(), reinterpret_cast<fftw_complex*>(fft_coefs.data()), FFTW_ESTIMATE);
        if (!plan) {
          throw Napi::Error::New(env, "FFTW plan creation failed (r2c)"); // Throw error if plan creation fails
        }

        fftw_execute(plan);
        fftw_destroy_plan(plan);


        std::vector<double> fft_freq(N);
        for (int i = 0; i < N; ++i) {
            fft_freq[i] = i / static_cast<double>(N);
        }

        double freq_max = 0.005;

        for (int i = 0; i < N; ++i) {
            if (std::abs(fft_freq[i]) >= freq_max) {
                fft_coefs[i] = 0;
            }
        }


        plan = fftw_plan_dft_c2r_1d(N, reinterpret_cast<fftw_complex*>(fft_coefs.data()), fft_prices.data(), FFTW_ESTIMATE);

        if (!plan) {
          throw Napi::Error::New(env, "FFTW plan creation failed (c2r)");  // Throw error if plan creation fails
        }

        fftw_execute(plan);
        fftw_destroy_plan(plan);


        for (int i = 0; i < N; ++i) {
            fft_prices[i] /= N;
        }

        result = Napi::Array::New(env, N); // Initialize result inside try block
        for (size_t i = 0; i < N; i++) {
            result[i] = Napi::Number::New(env, fft_prices[i]);
        }

    } catch (const Napi::Error& e) {
        e.ThrowAsJavaScriptException();
        return Napi::Array::New(env); // Return empty array on exception
    }


    return result;
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "processPrices"), Napi::Function::New(env, processPrices));
    return exports;
}


NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)