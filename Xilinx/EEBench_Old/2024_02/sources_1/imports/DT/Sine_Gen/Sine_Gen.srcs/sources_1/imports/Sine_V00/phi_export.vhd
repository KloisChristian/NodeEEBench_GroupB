
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use ieee.numeric_std.all;
use IEEE.math_real.all;
use std.textio.all;
library work;


entity phi_export is
generic(
    width: natural := 26;
    width_plus: natural := 6
    );
port (
    CLK: in STD_LOGIC;
    RST: in STD_LOGIC;
    FCLK: in STD_LOGIC;
    sel: in STD_LOGIC_VECTOR(3 downto 0);  -- maximum 4M samples ; needs 22bits
    mysine: in STD_LOGIC_VECTOR(width-1 downto 0); -- (25 downto 0)           26bits
    StepRe: out STD_LOGIC_VECTOR(width+width_plus-1 downto 0); -- (31 downto 0)    32bits
    StepIm: out STD_LOGIC_VECTOR(width+width_plus-1 downto 0); -- (31 downto 0)    32bits
    Step1Re: out STD_LOGIC_VECTOR(width+width_plus-1 downto 0); -- (31 downto 0)    32bits
    Step1Im: out STD_LOGIC_VECTOR(width+width_plus-1 downto 0) -- (31 downto 0)    32bits
    );
end phi_export;

architecture Behavioral of phi_export is

------non-constant real-valued expression is not supported
------constant real-valued expression is supported

constant magnitude: real := 2**(real(width+width_plus - 1))-1.0;

constant inter: real := 256.0;

-- switch (4 downto 3) control prime number
-- 00  1
-- 01  17
-- 10  127
-- 11  7993
constant prime0: real := 1.0;
constant prime1: real := 17.0;
constant prime2: real := 127.0;
constant prime3: real := 7993.0;
-- switch (6 downto 5) control number of samples
-- 00  1k
-- 01  16k 
-- 10  256k
-- 11  4M
constant sample0: real := 1024.0;
constant sample1: real := 16.0*sample0;
constant sample2: real := 16.0*sample1;
constant sample3: real := 16.0*sample2;

-- switch (6 downto 3)
--          sample      prime
-- 0000     1k          1
-- 0001     1k          17
-- 0010     1k          127
-- 0011     1k          7993
constant phi0: real := real(2)*math_PI*prime0/sample0;     -- degree
constant phi1: real := real(2)*math_PI*prime1/sample0;     -- degree
constant phi2: real := real(2)*math_PI*prime2/sample0;     -- degree
constant phi3: real := real(2)*math_PI*prime3/sample0;     -- degree
constant phi16: real := real(2)*math_PI*(prime0*inter/sample0 - trunc(prime0*inter/sample0));     -- degree
constant phi17: real := real(2)*math_PI*(prime1*inter/sample0 - trunc(prime1*inter/sample0));     -- degree
constant phi18: real := real(2)*math_PI*(prime2*inter/sample0 - trunc(prime2*inter/sample0));     -- degree
constant phi19: real := real(2)*math_PI*(prime3*inter/sample0 - trunc(prime3*inter/sample0));     -- degree
--          sample      prime
-- 0100     16k         1
-- 0101     16k         17
-- 0110     16k         127
-- 0111     16k         7993
constant phi4: real := real(2)*math_PI*prime0/sample1;     -- degree
constant phi5: real := real(2)*math_PI*prime1/sample1;     -- degree
constant phi6: real := real(2)*math_PI*prime2/sample1;     -- degree
constant phi7: real := real(2)*math_PI*prime3/sample1;     -- degree
constant phi20: real := real(2)*math_PI*(prime0*inter/sample1 - trunc(prime0*inter/sample1));     -- degree
constant phi21: real := real(2)*math_PI*(prime1*inter/sample1 - trunc(prime1*inter/sample1));     -- degree
constant phi22: real := real(2)*math_PI*(prime2*inter/sample1 - trunc(prime2*inter/sample1));     -- degree
constant phi23: real := real(2)*math_PI*(prime3*inter/sample1 - trunc(prime3*inter/sample1));     -- degree
--          sample      prime
-- 1000     256k        1
-- 1001     256k        17
-- 1010     256k        127
-- 1011     256k        7993
constant phi8: real := real(2)*math_PI*prime0/sample2;     -- degree
constant phi9: real := real(2)*math_PI*prime1/sample2;     -- degree
constant phi10: real := real(2)*math_PI*prime2/sample2;     -- degree
constant phi11: real := real(2)*math_PI*prime3/sample2;     -- degree
constant phi24: real := real(2)*math_PI*(prime0*inter/sample2 - trunc(prime0*inter/sample2));     -- degree
constant phi25: real := real(2)*math_PI*(prime1*inter/sample2 - trunc(prime1*inter/sample2));     -- degree
constant phi26: real := real(2)*math_PI*(prime2*inter/sample2 - trunc(prime2*inter/sample2));     -- degree
constant phi27: real := real(2)*math_PI*(prime3*inter/sample2 - trunc(prime3*inter/sample2));     -- degree
--          sample      prime
-- 1100     4M          1
-- 1101     4M          17
-- 1110     4M          127
-- 1111     4M          7993
constant phi12: real := real(2)*math_PI*prime0/sample3;     -- degree
constant phi13: real := real(2)*math_PI*prime1/sample3;     -- degree
constant phi14: real := real(2)*math_PI*prime2/sample3;     -- degree
constant phi15: real := real(2)*math_PI*prime3/sample3;     -- degree
constant phi28: real := real(2)*math_PI*(prime0*inter/sample3 - trunc(prime0*inter/sample3));     -- degree
constant phi29: real := real(2)*math_PI*(prime1*inter/sample3 - trunc(prime1*inter/sample3));     -- degree
constant phi30: real := real(2)*math_PI*(prime2*inter/sample3 - trunc(prime2*inter/sample3));     -- degree
constant phi31: real := real(2)*math_PI*(prime3*inter/sample3 - trunc(prime3*inter/sample3));     -- degree



signal StepReX0, StepReX1, StepReX2, StepReX3, StepReX4, StepReX5, StepReX6, StepReX7: std_logic_vector(width+width_plus-1 downto 0);
signal StepReX8, StepReX9, StepReX10, StepReX11, StepReX12, StepReX13, StepReX14, StepReX15: std_logic_vector(width+width_plus-1 downto 0);
signal StepReY0, StepReY1, StepReY2, StepReY3, StepReY4, StepReY5, StepReY6, StepReY7: std_logic_vector(width+width_plus-1 downto 0);
signal StepReY8, StepReY9, StepReY10, StepReY11, StepReY12, StepReY13, StepReY14, StepReY15: std_logic_vector(width+width_plus-1 downto 0);

signal StepReX16, StepReX17, StepReX18, StepReX19, StepReX20, StepReX21, StepReX22, StepReX23: std_logic_vector(width+width_plus-1 downto 0);
signal StepReX24, StepReX25, StepReX26, StepReX27, StepReX28, StepReX29, StepReX30, StepReX31: std_logic_vector(width+width_plus-1 downto 0);
signal StepReY16, StepReY17, StepReY18, StepReY19, StepReY20, StepReY21, StepReY22, StepReY23: std_logic_vector(width+width_plus-1 downto 0);
signal StepReY24, StepReY25, StepReY26, StepReY27, StepReY28, StepReY29, StepReY30, StepReY31: std_logic_vector(width+width_plus-1 downto 0);


type ROM_TYPE is array (0 to 2**5 - 1 ) of std_logic_vector(width+width_plus-1 downto 0);
  
  
  signal ROM_stepReX : ROM_TYPE;
  signal ROM_stepImX : ROM_TYPE;
  
begin

ROM_stepReX <= (StepReX0, StepReX1, StepReX2, StepReX3, StepReX4, StepReX5, StepReX6, StepReX7, 
                StepReX8, StepReX9, StepReX10, StepReX11, StepReX12, StepReX13, StepReX14, StepReX15,
                StepReX16, StepReX17, StepReX18, StepReX19, StepReX20, StepReX21, StepReX22, StepReX23,
                StepReX24, StepReX25, StepReX26, StepReX27, StepReX28, StepReX29, StepReX30, StepReX31);
ROM_stepImX <= (StepReY0, StepReY1, StepReY2, StepReY3, StepReY4, StepReY5, StepReY6, StepReY7, 
                StepReY8, StepReY9, StepReY10, StepReY11, StepReY12, StepReY13, StepReY14, StepReY15,
                StepReY16, StepReY17, StepReY18, StepReY19, StepReY20, StepReY21, StepReY22, StepReY23,
                StepReY24, StepReY25, StepReY26, StepReY27, StepReY28, StepReY29, StepReY30, StepReY31);
-- MATH_DEG_TO_RAD*
StepReX0 <=std_logic_vector(to_signed(integer( magnitude * cos(phi0)), StepReX0'length));
StepReY0 <=std_logic_vector(to_signed(integer( magnitude * sin(phi0)), StepReY0'length));
StepReX1 <=std_logic_vector(to_signed(integer( magnitude * cos(phi1)), StepReX1'length));
StepReY1 <=std_logic_vector(to_signed(integer( magnitude * sin(phi1)), StepReY1'length));
StepReX2 <=std_logic_vector(to_signed(integer( magnitude * cos(phi2)), StepReX2'length));
StepReY2 <=std_logic_vector(to_signed(integer( magnitude * sin(phi2)), StepReY2'length));
StepReX3 <=std_logic_vector(to_signed(integer( magnitude * cos(phi3)), StepReX3'length));
StepReY3 <=std_logic_vector(to_signed(integer( magnitude * sin(phi3)), StepReY3'length));
StepReX4 <=std_logic_vector(to_signed(integer( magnitude * cos(phi4)), StepReX4'length));
StepReY4 <=std_logic_vector(to_signed(integer( magnitude * sin(phi4)), StepReY4'length));
StepReX5 <=std_logic_vector(to_signed(integer( magnitude * cos(phi5)), StepReX5'length));
StepReY5 <=std_logic_vector(to_signed(integer( magnitude * sin(phi5)), StepReY5'length));
StepReX6 <=std_logic_vector(to_signed(integer( magnitude * cos(phi6)), StepReX6'length));
StepReY6 <=std_logic_vector(to_signed(integer( magnitude * sin(phi6)), StepReY6'length));
StepReX7 <=std_logic_vector(to_signed(integer( magnitude * cos(phi7)), StepReX7'length));
StepReY7 <=std_logic_vector(to_signed(integer( magnitude * sin(phi7)), StepReY7'length));
StepReX8 <=std_logic_vector(to_signed(integer( magnitude * cos(phi8)), StepReX8'length));
StepReY8 <=std_logic_vector(to_signed(integer( magnitude * sin(phi8)), StepReY8'length));
StepReX9 <=std_logic_vector(to_signed(integer( magnitude * cos(phi9)), StepReX9'length));
StepReY9 <=std_logic_vector(to_signed(integer( magnitude * sin(phi9)), StepReY9'length));
StepReX10 <=std_logic_vector(to_signed(integer( magnitude * cos(phi10)), StepReX10'length));
StepReY10 <=std_logic_vector(to_signed(integer( magnitude * sin(phi10)), StepReY10'length));
StepReX11 <=std_logic_vector(to_signed(integer( magnitude * cos(phi11)), StepReX11'length));
StepReY11 <=std_logic_vector(to_signed(integer( magnitude * sin(phi11)), StepReY11'length));
StepReX12 <=std_logic_vector(to_signed(integer( magnitude * cos(phi12)), StepReX12'length));
StepReY12 <=std_logic_vector(to_signed(integer( magnitude * sin(phi12)), StepReY12'length));
StepReX13 <=std_logic_vector(to_signed(integer( magnitude * cos(phi13)), StepReX13'length));
StepReY13 <=std_logic_vector(to_signed(integer( magnitude * sin(phi13)), StepReY13'length));
StepReX14 <=std_logic_vector(to_signed(integer( magnitude * cos(phi14)), StepReX14'length));
StepReY14 <=std_logic_vector(to_signed(integer( magnitude * sin(phi14)), StepReY14'length));
StepReX15 <=std_logic_vector(to_signed(integer( magnitude * cos(phi15)), StepReX15'length));
StepReY15 <=std_logic_vector(to_signed(integer( magnitude * sin(phi15)), StepReY15'length));

-- correct angle for inter steps
StepReX16 <=std_logic_vector(to_signed(integer( magnitude * cos(phi16)), StepReX0'length));
StepReY16 <=std_logic_vector(to_signed(integer( magnitude * sin(phi16)), StepReY0'length));
StepReX17 <=std_logic_vector(to_signed(integer( magnitude * cos(phi17)), StepReX1'length));
StepReY17 <=std_logic_vector(to_signed(integer( magnitude * sin(phi17)), StepReY1'length));
StepReX18 <=std_logic_vector(to_signed(integer( magnitude * cos(phi18)), StepReX2'length));
StepReY18 <=std_logic_vector(to_signed(integer( magnitude * sin(phi18)), StepReY2'length));
StepReX19 <=std_logic_vector(to_signed(integer( magnitude * cos(phi19)), StepReX3'length));
StepReY19 <=std_logic_vector(to_signed(integer( magnitude * sin(phi19)), StepReY3'length));
StepReX20 <=std_logic_vector(to_signed(integer( magnitude * cos(phi20)), StepReX4'length));
StepReY20 <=std_logic_vector(to_signed(integer( magnitude * sin(phi20)), StepReY4'length));
StepReX21 <=std_logic_vector(to_signed(integer( magnitude * cos(phi21)), StepReX5'length));
StepReY21 <=std_logic_vector(to_signed(integer( magnitude * sin(phi21)), StepReY5'length));
StepReX22 <=std_logic_vector(to_signed(integer( magnitude * cos(phi22)), StepReX6'length));
StepReY22 <=std_logic_vector(to_signed(integer( magnitude * sin(phi22)), StepReY6'length));
StepReX23 <=std_logic_vector(to_signed(integer( magnitude * cos(phi23)), StepReX7'length));
StepReY23 <=std_logic_vector(to_signed(integer( magnitude * sin(phi23)), StepReY7'length));
StepReX24 <=std_logic_vector(to_signed(integer( magnitude * cos(phi24)), StepReX8'length));
StepReY24 <=std_logic_vector(to_signed(integer( magnitude * sin(phi24)), StepReY8'length));
StepReX25 <=std_logic_vector(to_signed(integer( magnitude * cos(phi25)), StepReX9'length));
StepReY25 <=std_logic_vector(to_signed(integer( magnitude * sin(phi25)), StepReY9'length));
StepReX26 <=std_logic_vector(to_signed(integer( magnitude * cos(phi26)), StepReX10'length));
StepReY26 <=std_logic_vector(to_signed(integer( magnitude * sin(phi26)), StepReY10'length));
StepReX27 <=std_logic_vector(to_signed(integer( magnitude * cos(phi27)), StepReX11'length));
StepReY27 <=std_logic_vector(to_signed(integer( magnitude * sin(phi27)), StepReY11'length));
StepReX28 <=std_logic_vector(to_signed(integer( magnitude * cos(phi28)), StepReX12'length));
StepReY28 <=std_logic_vector(to_signed(integer( magnitude * sin(phi28)), StepReY12'length));
StepReX29 <=std_logic_vector(to_signed(integer( magnitude * cos(phi29)), StepReX13'length));
StepReY29 <=std_logic_vector(to_signed(integer( magnitude * sin(phi29)), StepReY13'length));
StepReX30 <=std_logic_vector(to_signed(integer( magnitude * cos(phi30)), StepReX14'length));
StepReY30 <=std_logic_vector(to_signed(integer( magnitude * sin(phi30)), StepReY14'length));
StepReX31 <=std_logic_vector(to_signed(integer( magnitude * cos(phi31)), StepReX15'length));
StepReY31 <=std_logic_vector(to_signed(integer( magnitude * sin(phi31)), StepReY15'length));
 
StepRe <= ROM_stepRex(to_integer(unsigned('0'&sel)));
StepIm <= ROM_stepImx(to_integer(unsigned('0'&sel)));
Step1Re <= ROM_stepRex(to_integer(unsigned('1'&sel)));  -- step * inter vector 
Step1Im <= ROM_stepImx(to_integer(unsigned('1'&sel)));  -- step * inter vector


--StepRe <= std_logic_vector(to_signed(integer(ROM_stepRex(to_integer(unsigned(sel)))), StepRe'length));
--StepIm <= std_logic_vector(to_signed(integer(ROM_stepImx(to_integer(unsigned(sel)))), StepIm'length));
--StepRe <= "01111111110110010010010011001010";
--StepIm <= "00000110001110110100110001001111";
end Behavioral;
