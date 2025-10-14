import { useEffect, useRef } from 'react';

const Captcha = ({ onChange, width = 120, height = 40 }) => {
  const canvasRef = useRef(null);
  const codeRef = useRef('');

  const generateCode = () => {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const code = generateCode();
    codeRef.current = code;

    // 背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // 干扰线
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // 验证码文字
    for (let i = 0; i < code.length; i++) {
      ctx.font = `${20 + Math.random() * 10}px Arial`;
      ctx.fillStyle = `rgb(${Math.random() * 100},${Math.random() * 100},${Math.random() * 100})`;
      ctx.save();
      ctx.translate(20 + i * 25, 25);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    // 干扰点
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (onChange) {
      onChange(code);
    }
  };

  useEffect(() => {
    drawCaptcha();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={drawCaptcha}
      style={{ cursor: 'pointer', border: '1px solid #d9d9d9', borderRadius: '2px' }}
      title="点击刷新验证码"
    />
  );
};

export default Captcha;
