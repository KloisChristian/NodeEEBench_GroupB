----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date:    17:02:40 04/14/2012 
-- Design Name: 
-- Module Name:    CLK_DIV - Behavioral 
-- Project Name: 
-- Target Devices: 
-- Tool versions: 
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
use IEEE.std_logic_arith.all;

-- Uncomment the following library declaration if using
-- arithmetic functions with Signed or Unsigned values
--use IEEE.NUMERIC_STD.ALL;

-- Uncomment the following library declaration if instantiating
-- any Xilinx primitives in this code.
--library UNISIM;
--use UNISIM.VComponents.all;

entity CLK_DIV is
Port ( 
    CLK : in  STD_LOGIC;
    RST : in STD_LOGIC;
    EN_2 : out  STD_LOGIC;
    EN_4 : out  STD_LOGIC;
    EN_8 : out  STD_LOGIC;
    EN_16 : out  STD_LOGIC;
    EN_32 : out  STD_LOGIC;
    EN_64 : out  STD_LOGIC;
    EN_128 : out  STD_LOGIC;
    EN_256 : out  STD_LOGIC
);
end CLK_DIV;

architecture Behavioral of CLK_DIV is
SIGNAL count: STD_LOGIC_VECTOR( 7 downto 0);
begin
process(clk,RST)
    begin    
    if ( RST = '1') then   
        count<="00000000";
        EN_2 <= '0';
        EN_4 <= '0';
        EN_8 <= '0';
        EN_16 <= '0';
        EN_32 <= '0';
        EN_64 <= '0';
        EN_128 <= '0';
        EN_256 <= '0';
    
    elsif  ((clk'event) and clk='1') then 
        count <= unsigned(count) + 1;
        if (count(0) = '0') then    
            EN_2 <= '1';
        else
            EN_2 <= '0';
        end if;  
        if (count(1 downto 0) = "00") then  
            EN_4 <= '1';  
        else
            EN_4 <= '0';
        end if;  
        if (count(2 downto 0) = "000") then  
            EN_8 <= '1';  
        else
            EN_8 <= '0';
        end if; 			  
        if (count(3 downto 0) = "0000") then  
            EN_16 <= '1';  
        else
            EN_16 <= '0';
        end if;  			  
        if (count(4 downto 0) = "00000") then  
            EN_32 <= '1';  
        else
            EN_32 <= '0';
        end if;  			  
        if (count(5 downto 0) = "000000") then  
            EN_64 <= '1';  
        else
            EN_64 <= '0';
        end if;  			  
        if (count(6 downto 0) = "0000000") then  
            EN_128 <= '1';  
        else
            EN_128 <= '0';
        end if;
        if (count(7 downto 0) = "00000000") then  
            EN_256 <= '1';  
        else
            EN_256 <= '0';
        end if;  
    
    end if;
end process;
end Behavioral;