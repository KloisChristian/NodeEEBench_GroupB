onbreak {quit -f}
onerror {quit -f}

vsim -voptargs="+acc" -t 1ps -L xil_defaultlib -L secureip -lib xil_defaultlib xil_defaultlib.XADC_EE

do {wave.do}

view wave
view structure
view signals

do {XADC_EE.udo}

run -all

quit -force
