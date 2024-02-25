
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.STD_LOGIC_ARITH.ALL;
use std.textio.all;
library work;
use work.txt_util.all;

entity tb_TOPLOG is
end tb_TOPLOG;

architecture Behavioral of tb_TOPLOG is

component TOP is
generic(
    width: natural := 26;
    width_plus: natural := 6
    );
port(
    CLK: in STD_LOGIC;
    btn_c: in STD_LOGIC;
    sw: in STD_LOGIC_VECTOR(10 downto 0);
    led: out STD_LOGIC_VECTOR(10 downto 0);  
    seg: OUT STD_LOGIC_VECTOR (6 DOWNTO 0);  -- Segments
    an: OUT STD_LOGIC_VECTOR (3 DOWNTO 0);  -- Digit
    dp: OUT STD_LOGIC;  -- dot in Segment
    JA: out STD_LOGIC_VECTOR(7 downto 0);
    JB: out STD_LOGIC_VECTOR(7 downto 0);
    JC: out STD_LOGIC_VECTOR(7 downto 0);
    JD: out STD_LOGIC_VECTOR(7 downto 0)
   );
end component;

 	--Inputs
signal CLK : std_logic := '0';
signal btn_c1 : std_logic := '0';
signal sw: std_logic_vector (10 downto 0);

 	--Outputs
signal JA, JB, JC, JD : std_logic_vector(7 downto 0); -- 8 bit
signal led: std_logic_vector (10 downto 0);
signal seg: STD_LOGIC_VECTOR (6 DOWNTO 0);  -- Segments
signal an: STD_LOGIC_VECTOR (3 DOWNTO 0);  -- Digit
signal dp: STD_LOGIC;  -- dot in Segment
signal mysine0: std_logic_vector (31 downto 0);

   -- Clock period definitions
constant CLK_period : time := 10 ns;

     -- export
signal export_cnt: integer :=-2;
constant div : real := 8.0;
constant angle: real :=180.0/div;
constant cycle: real := 360.0/angle;
  
begin  
TOP0 : TOP 
generic map(
    width => 26,
    width_plus=> 6
    )
        port map(
        CLK =>CLK,
        btn_c =>btn_c1,
        sw =>sw,
        led =>led,
        JA =>JA,
        JB =>JB,
        JC =>JC,
        JD =>JD
        );
        
CLK_gen : process
begin
CLK <= '1';
wait for CLK_PERIOD / 2;
CLK <= '0';
wait for CLK_PERIOD / 2;
end process CLK_gen;

simulation : process

begin		

-- switch (2 downto 0) control CLK divider output
-- 000  tclk        100MHz      10ns
-- 001  tclk/2      50MHz       20ns
-- 010  tclk/4      25MHz       40ns
-- 011  tclk/8      12.5MHz     80ns
-- 100  tclk/16     6.25MHz     160ns
-- 101  tclk/32     3.125MHz    320ns
-- 110  tclk/64     1.5625MHz   640ns
-- 111  tclk/128    781.25KHz   1.28us

-- switch (4 downto 3) control prime number
-- 00  1
-- 01  17
-- 10  127
-- 11  7993

-- switch (6 downto 5) control number of samples
-- 00  1k
-- 01  16k 
-- 10  256k
-- 11  4M

--         01         16k samples 1024
--           10       127     cycles
--             011    12.5Mhz           
sw <= "00010110011";  -- 16k, 127, 12.5 Mhz -> simulation time
-- 160ns per sample +190ns first sample sim time 163840ns

--         01         16k samples    16384
--           10       127     cycles
--             011    12.5Mhz           
sw <= "00010110011";  -- 16k, 127, 12.5 Mhz -> simulation time
-- 160ns per sample +190ns first sample sim time 2621630ns

--         01         16k samples
--           01       17     cycles
--             011    12.5Mhz           
wait for 5 ns;    
sw <= "00010101011";  -- 16k, 127, 12.5 Mhz -> simulation time
-- 160ns per sample +190ns first sample sim time 2621630ns

--         00         256k samples 1024
--           01       17   cycles       
--             011    12.5Mhz           80ns
wait for 5 ns;    
sw <= "00010001011";  -- 256k sample
-- 160ns per sample +190ns first sample sim time 170000ns

-- look at countX, sample, refresh_cnt, Curr_inter_Re, Curr_inter_Im, Step_inter_Re, Step_inter_Im

-- hold reset state for 100 ns.
wait for 5 ns;    
btn_c1 <= '1';
wait for 10 ns;    
btn_c1 <= '0';
wait for 5 ns;    

wait for CLK_period*100000;
wait for CLK_period*100000;
wait for CLK_period*100000;
wait for CLK_period*100000;
wait for CLK_period*100000;
wait for CLK_period*100000;
wait for CLK_period*100000;
wait for CLK_period*100000;
wait for 50 ms; 
  
end process simulation;

mysine0 <= JA(3 downto 0) & JD(3 downto 0) & JA(7 downto 4) & JD(7 downto 4)
         & JC(3 downto 0) & JB(3 downto 0) & JC(7 downto 4) & JB(7 downto 4);
         
Export : process(clk,mysine0)
variable line_v0 : line;
variable line_v1 : line;
file out_file0 : text open write_mode is "mysine0_out.txt";
file out_file1 : text open write_mode is "mysine0_everysteps_out.txt";

begin
if (mysine0'event) then
    export_cnt <= export_cnt+1;
    write(line_v1,"x"&hstr(mysine0));
    writeline(out_file1, line_v1);
        if ((export_cnt rem integer(cycle)) = 0) then
            export_cnt <= 1;
            write(line_v0,"x"&hstr(mysine0));
            writeline(out_file0, line_v0);
        end if;
end if;
end process Export;


end Behavioral;
