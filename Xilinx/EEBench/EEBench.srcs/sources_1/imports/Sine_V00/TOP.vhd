
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.STD_LOGIC_ARITH.ALL;

entity TOP is
generic(
    width: natural := 26;
    width_plus: natural := 6
);
port (
    clk: in STD_LOGIC;
    btn_c: in STD_LOGIC;
    sw: in STD_LOGIC_VECTOR(10 downto 0);
    led : out STD_LOGIC_VECTOR(10 downto 0);
    seg: OUT STD_LOGIC_VECTOR (6 DOWNTO 0);   -- Segments
    an: OUT STD_LOGIC_VECTOR (3 DOWNTO 0);    -- Digit
    dp: OUT STD_LOGIC;                        -- dot in Segment
    JA: out STD_LOGIC_VECTOR(7 downto 0);
    JB: out STD_LOGIC_VECTOR(7 downto 0);
    JC: out STD_LOGIC_VECTOR(7 downto 0);
    JD: out STD_LOGIC_VECTOR(7 downto 0)
);
end TOP;
  
---------------------------------------------------------------
--  IN:      clk, btn_c, sw   
--  DISPLAY: led, seg, an ,dp
--  OUT:     JA, JB, JC, JD  
--  Sine generator: sw controls tclk(8), Ncycle(4), nsample(4)
----------------------------------------------------------------
-- Subcircuits
-- SegCntrl: Displays values on 4 digit 7 segment display
--      HEX3LEDA hexadecimal encoding for 7 segements
----------------------------------------------------------------
    
architecture Behavioral of TOP is

 -- Component Declaration

COMPONENT sineX
   Port (
       CLK : in STD_LOGIC;
       RST: in STD_LOGIC;
       step: in STD_LOGIC_Vector(31 downto 0);   -- increment
       amplitude: in STD_LOGIC_Vector(31 downto 0);   -- signal amplitude
       offset: in STD_LOGIC_Vector(31 downto 0);   -- signal offset
       mySine: out STD_LOGIC_Vector(31 downto 0) 
   );
end COMPONENT;

COMPONENT SegCntrl
PORT(
    CLK1: IN STD_LOGIC;                            -- clock (naturally)
    Digit0: IN STD_LOGIC_VECTOR (3 DOWNTO 0);
    Digit1: IN STD_LOGIC_VECTOR (3 DOWNTO 0);
    Digit2: IN STD_LOGIC_VECTOR (3 DOWNTO 0);
    Digit3: IN STD_LOGIC_VECTOR (3 DOWNTO 0);
    reset: IN STD_LOGIC;
    seg: OUT STD_LOGIC_VECTOR (6 DOWNTO 0);    -- Segments
    an: OUT STD_LOGIC_VECTOR (3 DOWNTO 0);       -- Digit
    dp: OUT STD_LOGIC                               -- dot in Segment
);
END COMPONENT;

signal sel1: STD_LOGIC_VECTOR(1 downto 0);
signal sel2: STD_LOGIC_VECTOR (1 downto 0);
signal sel3: STD_LOGIC_VECTOR (2 downto 0);
signal sel4, sel5: STD_LOGIC_VECTOR (3 downto 0);
signal mysine0: STD_LOGIC_VECTOR(31 downto 0);
signal Nsample: STD_LOGIC_VECTOR(22 downto 0);  -- maximum 4M samples ; needs >= 22bits
--signal Nprime: STD_LOGIC_VECTOR(13 downto 0);  -- maximum 7993 prime number ; needs 13bits
signal seg_dis: STD_LOGIC_VECTOR(15 downto 0);
signal StepRe, StepIm: STD_LOGIC_VECTOR(width+width_plus-1 downto 0);
-- signal Step0Re, Step0Im: STD_LOGIC_VECTOR(width+width_plus-1 downto 0);
signal Step1Re, Step1Im: STD_LOGIC_VECTOR(width+width_plus-1 downto 0);
signal dpx: STD_LOGIC;
signal reset: STD_LOGIC;

signal step, amplitude, offset: STD_LOGIC_VECTOR(31 downto 0);

begin
 sel5 <= sw(10 downto 7);
 seg_dis <= StepIm(15 downto 0) when sel5="0001" else
            StepIm(31 downto 16) when sel5="0010" else 
            StepRe(15 downto 0) when sel5="0100" else 
            StepRe(31 downto 16) when sel5="1000" else 
            "0000000000000000";

 SEG0: Segcntrl
 port map (
    CLK1 => CLK,
    Digit0 => seg_dis(3 downto 0),
    Digit1 => seg_dis(7 downto 4), 
    Digit2 => seg_dis(11 downto 8),
    Digit3 => seg_dis(15 downto 12),
    reset => reset,
    seg => seg,
    an => an,
    dp => dpx
);

reset <=btn_c;
dp <= dpx;
led <= sw;

JB(7 downto 4) <=mysine0(3 downto 0);
JC(7 downto 4) <=mysine0(7 downto 4);

JB(3 downto 0) <=mysine0(11 downto 8);
JC(3 downto 0) <=mysine0(15 downto 12);

JD(7 downto 4) <=mysine0(19 downto 16);
JA(7 downto 4) <=mysine0(23 downto 20);

JD(3 downto 0) <= mysine0(27 downto 24);
JA(3 downto 0) <= mysine0(31 downto 28);

     --         33222222222211111111110000000000
     --         10987654321098765432109876543210 
--     step <=  x"00011000"; -- 256k samples 11ms repetition after 262142 points should be 26144 
-- amplitude <=  x"7FFFFFFF"; -- Full amplitude??
-- offset <=  x"40000000"; -- Full offset
-- step = 2**32 * Ncycle/NFFT = 4*1024*1024*1024* NCycle / NFFT

--     step <=  x"00022000"; -- 128k samples 17 cycles 6ms sim time ok
-- amplitude <=  x"7FFFFFFF"; -- Full amplitude??
-- offset <=  x"40000000"; -- Full offset

--     step <=  x"00065000"; -- 256k samples 101 cycles 11ms sim time ok
-- amplitude <=  x"7FFFFFFF"; -- Full amplitude??
-- offset <=  x"40000000"; -- Full offset

     step <=  x"000FA400"; -- 1M samples 1001 cycles 44ms sim time ok
amplitude <=  x"7FFFFFFF"; -- Full amplitude??
   offset <=  x"40000000"; -- Full offset

mySineX: sineX
   Port map (
       CLK => CLK,
       RST => reset,
       step => step,
       amplitude => amplitude,   -- signal amplitude
       offset=> offset,   -- signal offset
       mySine => mysine0 
   );

end Behavioral;
