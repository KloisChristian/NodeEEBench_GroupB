onbreak {quit -force}
onerror {quit -force}

asim -t 1ps +access +r +m+XADC_EE -L xil_defaultlib -L secureip -O5 xil_defaultlib.XADC_EE

do {wave.do}

view wave
view structure

do {XADC_EE.udo}

run -all

endsim

quit -force
