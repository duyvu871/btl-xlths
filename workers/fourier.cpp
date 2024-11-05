#include <iostream>
#include <vector>
#include <complex>
#include <fftw3.h>

std::vector<double> processPrices(const std::vector<double>& prices_BTC) {
    int N = prices_BTC.size();
    std::vector<std::complex<double>> fft_coefs(N);
    std::vector<double> fft_prices(N);

    // Perform FFT
    fftw_plan plan = fftw_plan_dft_r2c_1d(N, const_cast<double*>(prices_BTC.data()), reinterpret_cast<fftw_complex*>(fft_coefs.data()), FFTW_ESTIMATE);
    fftw_execute(plan);
    fftw_destroy_plan(plan);

    // Frequency array
    std::vector<double> fft_freq(N);
    for (int i = 0; i < N; ++i) {
        fft_freq[i] = i / static_cast<double>(N);
    }

    double freq_max = 0.005;

    // Zero out frequencies above freq_max
    for (int i = 0; i < N; ++i) {
        if (std::abs(fft_freq[i]) >= freq_max) {
            fft_coefs[i] = 0;
        }
    }

    // Perform inverse FFT
    plan = fftw_plan_dft_c2r_1d(N, reinterpret_cast<fftw_complex*>(fft_coefs.data()), fft_prices.data(), FFTW_ESTIMATE);
    fftw_execute(plan);
    fftw_destroy_plan(plan);

    // Normalize the result
    for (int i = 0; i < N; ++i) {
        fft_prices[i] /= N;
    }

    return fft_prices;
}

