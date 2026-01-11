function hexToRgb(hex) {
  const v = hex.slice(1);
  return {
    r: parseInt(v.slice(0,2),16),
    g: parseInt(v.slice(2,4),16),
    b: parseInt(v.slice(4,6),16)
  };
}

function rgbToHsl({r,g,b}) {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;

  if(max===min){h=s=0;}
  else {
    const d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){
      case r:h=(g-b)/d+(g<b?6:0);break;
      case g:h=(b-r)/d+2;break;
      case b:h=(r-g)/d+4;
    }
    h*=60;
  }
  return {h:Math.round(h), s:Math.round(s*100), l:Math.round(l*100)};
}
