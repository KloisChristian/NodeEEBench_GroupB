----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 06.11.2022 13:01:09
-- Design Name: 
-- Module Name: mul_com - Behavioral
-- Project Name: 
-- Target Devices: 
-- Tool Versions: 
-- Description: 
-- 
-- Dependencies: 
-- 
-- Revision:
-- Revision 0.01 - File Created
-- Additional Comments:
-- 
----------------------------------------------------------------------------------


library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.STD_LOGIC_ARITH.ALL;
use IEEE.STD_LOGIC_UNSIGNED.ALL;

entity mul_com is
port ( 
  CLK : in  std_logic;
  RST : in  std_logic;
  ReA : in  std_logic_vector(31 downto 0);
  ImA : in  std_logic_vector(31 downto 0);
  ReB : in  std_logic_vector(31 downto 0);
  ImB : in  std_logic_vector(31 downto 0);
  ReC : out std_logic_vector(31 downto 0);
  ImC : out std_logic_vector(31 downto 0)
  );
end mul_com;

architecture Behavioral of mul_com is

COMPONENT pipe_mul 
generic(
    width: natural := 26;
    width_plus: natural := 6
);
PORT(
    CLK : in  std_logic;
    RST : in  std_logic;
    A : in  std_logic_vector(width+width_plus-1 downto 0);
    B : in  std_logic_vector(width+width_plus-1 downto 0);
    C : out signed((width+width_plus)*2-1 downto 0)
);
END COMPONENT;

-- partial complex multiplication
signal multi_1, multi_2, multi_3, multi_4: signed(63 downto 0);  -- (63 downto 0)      64bits (width_plus =6)
--                                   1234123412341234  
signal rp : signed(63 downto 0) := X"0000000000000000"; -- rounding numbers
signal rm : signed(63 downto 0) := (others => '0'); -- rounding numbers

begin

-- multi_(1/2/3/4) = Step_inter_(Re/Im) * Curr_inter_(Re/Im)
pipe_mul1 : pipe_mul 
port map(
    CLK =>CLK,
    RST =>RST,
    A =>ReA,
    B =>ReB,
    C =>multi_1
);
pipe_mul2 : pipe_mul 
port map(
    CLK =>CLK,
    RST =>RST,
    A =>ImA,
    B =>ImB,
    C =>multi_2
);
pipe_mul3 : pipe_mul 
port map(
    CLK =>CLK,
    RST =>RST,
    A =>ReA,
    B =>ImB,
    C =>multi_3
);
pipe_mul4 : pipe_mul 
port map(
    CLK =>CLK,
    RST =>RST,
    A =>ImA,
    B =>ReB,
    C =>multi_4
);

process(clk)

variable multi_1t, multi_2t, multi_3t, multi_4t: signed(63 downto 0);  -- (31 downto 0)      32bits (width_plus =6)
variable multi_1r, multi_2r, multi_3r, multi_4r: signed(31 downto 0);  -- (31 downto 0)      32bits (width_plus =6)
variable multi_Re, multi_Im: signed(31 downto 0);  -- (31 downto 0)      32bits (width_plus =6)
variable multi_Re_STD, multi_Im_STD: std_logic_vector(31 downto 0);  -- (31 downto 0)      32bits (width_plus =6)

begin
  if (rising_edge(clk)) then        
          -- multiplication with rounding add and truncate
          -- multi_1 <= signed(Step_inter_Re) * signed(Curr_inter_Re);   --multiplication
          if ( multi_1(62) = '0') then -- positive number
             multi_1t := multi_1 + rp;
          else                                         -- negativ number
             multi_1t := multi_1 + rm;
          end if;
          multi_1r := multi_1t(61 downto 30);  --truncate 
             
          -- multi_2 <= signed(Step_inter_Im) * signed(Curr_inter_Im);   --multiplication
          if ( multi_2(62) = '0') then -- positive number
             multi_2t := multi_2 + rp;
          else                                         -- negativ number
             multi_2t := multi_2 + rm;
          end if;
          multi_2r := multi_2t(61 downto 30);  --truncate 
        
          -- multi_3 <= signed(Step_inter_Re) * signed(Curr_inter_Im);   --multiplication
          if ( multi_3(62) = '0') then -- positive number
             multi_3t := multi_3 + rp;
          else                                         -- negativ number
             multi_3t := multi_3 + rm;
          end if;
          multi_3r := multi_3t(61 downto 30);  --truncate 
        
          --multi_4 <= signed(Step_inter_Im) * signed(Curr_inter_Re);   --multiplication
          if ( multi_4(62) = '0') then -- positive number
             multi_4t := multi_4 + rp;
          else                                         -- negativ number
             multi_4t := multi_4 + rm;
          end if;
          multi_4r := multi_4t(61 downto 30);     --truncate by 30 bits 
        
          multi_Re := multi_1r - multi_2r;
          multi_Im := multi_3r + multi_4r;
                
          multi_Re_STD := std_logic_vector(multi_Re);
          multi_Im_STD := std_logic_vector(multi_Im);
                         
          ReC <= multi_Re_STD;        -- output
          ImC <= multi_Im_STD;        -- output    
  end if;

end process;

end Behavioral;
