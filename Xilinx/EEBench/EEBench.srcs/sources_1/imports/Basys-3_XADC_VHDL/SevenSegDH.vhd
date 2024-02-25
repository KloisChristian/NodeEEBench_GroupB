----------------------------------------------------------------------------
--	SevenSegDH.vhd -- Controls 4 digits of seven segment display on BASYS3
----------------------------------------------------------------------------
-- Author:  Joerg Vollrath
----------------------------------------------------------------------------
-- Documentation
-- INPUT: CLK, BTN 5 Buttons
-- OUTPUT: btnDeBnc (5 Buttons stable)
--         btnDetect One Clock cycle high with rising button 
----------------------------------------------------------------------------
-- Revision History:
--  2022/10/05(JV): started
----------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.STD_LOGIC_ARITH.ALL;

--The IEEE.std_logic_unsigned contains definitions that allow 
--std_logic_vector types to be used with the + operator to instantiate a 
--counter.
use IEEE.std_logic_unsigned.all;

entity SevenSegDH is
    Port ( CLK			       : in  STD_LOGIC;
           RES			       : in  STD_LOGIC;                       -- reset
           D3                  : in STD_LOGIC_VECTOR (3 downto 0);
           D2                  : in STD_LOGIC_VECTOR (3 downto 0);
           D1                  : in STD_LOGIC_VECTOR (3 downto 0);
           D0                  : in STD_LOGIC_VECTOR (3 downto 0);
           DP                  : in STD_LOGIC_VECTOR (3 downto 0);    -- hex values digits and dp
           SSEG_CA 		       : out  STD_LOGIC_VECTOR (7 downto 0);  -- 7 segment + dp
           SSEG_AN 		       : out  STD_LOGIC_VECTOR (3 downto 0)   -- 4 digits 
	     );
end SevenSegDH;

architecture Behavioral of SevenSegDH is

signal count24: STD_LOGIC_VECTOR (23 downto 0);
signal ani: STD_LOGIC_VECTOR (3 downto 0);
signal dpi: STD_LOGIC;
signal dxi, d3i, d2i, d1i, d0i: STD_LOGIC_VECTOR (3 downto 0);
signal cai: STD_LOGIC_VECTOR (7 downto 0);
begin

-- Clock divider 
 process(CLK, RES)
     begin
       if ( RES = '1') then  -- asynchron reset with button 0
            count24 <= ( others => '0' );
       elsif  rising_edge(clk)  then 
            count24 <= count24 + 1;
       end if;
     end process;
 
 -- decode hex and dp 
 --      0    
 --     5  1
 --      6
 --     4  2
 --      3
 with dxi select
  cai <= 
    dpi&"1000000" when "0000", -- 0
    dpi&"1111001" when "0001", -- 1
    dpi&"0100100" when "0010", -- 2
    dpi&"0110000" when "0011", -- 3
    dpi&"0011001" when "0100", -- 4 
    dpi&"0010010" when "0101", -- 5
    dpi&"0000010" when "0110", -- 6
    dpi&"1111000" when "0111", -- 7
    dpi&"0000000" when "1000", -- 8
    dpi&"0010000" when "1001", -- 9
    dpi&"0001000" when "1010", -- A
    dpi&"0000011" when "1011", -- b
    dpi&"1000110" when "1100", -- C
    dpi&"0100001" when "1101", -- d
    dpi&"0000110" when "1110", -- E
    dpi&"0001110" when "1111", -- F
    "11111111" when others;
  
 -- activate anodes 
  process(CLK, RES, count24)
     begin
       if ( RES = '1') then  -- asynchron reset with button 0
            ani <= "1110";
       elsif  (rising_edge(clk) and (count24(14 downto 0)="100000000000000") ) then 
       
         case ani is
		   when "1110" => ani <= "1101"; dxi <= D1; dpi <= DP(1);
		   when "1101" => ani <= "1011"; dxi <= D2; dpi <= DP(2);
		   when "1011" => ani <= "0111"; dxi <= D3; dpi <= DP(3);
		   when "0111" => ani <= "1110"; dxi <= D0; dpi <= DP(0);
		   when others => ani <= "1110"; dxi <= D0; dpi <= DP(0);
         end case;
       end if;
     end process;
      SSEG_AN <= ani;
      SSEG_CA <= cai;
 	 
end Behavioral;

