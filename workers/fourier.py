import numpy as np
def processPrices(prices_BTC):
    fft_coefs = np.fft.fft(prices_BTC)
    fft_freq = np.fft.fftfreq(len(prices_BTC), d = 1)

    freq_max = 0.005
    fft_coefs[np.abs(fft_freq) >= freq_max] = 0

    fft_prices = np.fft.ifft(fft_coefs).real
    return fft_prices
