onbreak {quit -f}
onerror {quit -f}

vsim -t 1ps -lib xil_defaultlib XADC_EE_opt

do {wave.do}

view wave
view structure
view signals

do {XADC_EE.udo}

run -all

quit -force
