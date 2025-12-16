// Radar chart implementation for maturity visualization
const RadarChart = {
    // Draw radar chart on canvas
    draw(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const labels = Object.keys(data);
        const values = Object.values(data);

        // Set canvas size
        const size = 500;
        canvas.width = size;
        canvas.height = size;

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 80;
        const numPoints = labels.length;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw background circles (levels 1-5)
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 5; i++) {
            this.drawPolygon(ctx, centerX, centerY, radius * (i / 5), numPoints, '#e0e0e0', 1);
        }

        // Draw axes
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        for (let i = 0; i < numPoints; i++) {
            const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        // Draw labels
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
            const labelRadius = radius + 40;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            
            // Wrap long labels
            const label = labels[i];
            const words = label.split(' ');
            if (words.length > 2) {
                ctx.fillText(words.slice(0, 2).join(' '), x, y - 8);
                ctx.fillText(words.slice(2).join(' '), x, y + 8);
            } else {
                ctx.fillText(label, x, y);
            }
        }

        // Draw data polygon
        const dataPoints = [];
        for (let i = 0; i < numPoints; i++) {
            const value = values[i] || 0;
            const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
            const r = (radius * value) / 5; // Scale to max value of 5
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            dataPoints.push({ x, y });
        }

        // Fill data area
        ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
        ctx.beginPath();
        dataPoints.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.closePath();
        ctx.fill();

        // Draw data outline
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        dataPoints.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.closePath();
        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#667eea';
        dataPoints.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw level indicators
        ctx.fillStyle = '#999';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 1; i <= 5; i++) {
            ctx.fillText(i.toString(), centerX - 10, centerY - (radius * i / 5));
        }
    },

    // Helper function to draw polygon
    drawPolygon(ctx, centerX, centerY, radius, numPoints, strokeStyle, lineWidth) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        
        for (let i = 0; i <= numPoints; i++) {
            const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
    }
};
