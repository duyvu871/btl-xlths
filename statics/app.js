// Hàm gửi yêu cầu đổi khung thời gian biểu đồ
function changeChartTimeframe(timeframe) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: timeframe })
    };

    fetch('/api/change-timeframe', requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log('Timeframe changed successfully:', data);
            // Cập nhật biểu đồ theo khung thời gian mới nếu cần
            updateChartWithNewTimeframe(data.chartData);
        })
        .catch(error => console.error('Error changing timeframe:', error));
}


// Hàm gọi API lấy dữ liệu biểu đồ
function fetchChartData() {
    fetch('/api/get-chart-data')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched chart data:', data);
            // Cập nhật biểu đồ với dữ liệu mới
            updateChartWithData(data.chartData);
        })
        .catch(error => console.error('Error fetching chart data:', error));
}



// Hàm gọi API lấy dữ liệu cho biểu đồ line
function fetchLineChartData() {
    fetch('/api/get-line-chart-data')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched line chart data:', data);
            // Cập nhật biểu đồ line với dữ liệu mới
            updateLineChartWithData(data.lineChartData);
        })
        .catch(error => console.error('Error fetching line chart data:', error));
}