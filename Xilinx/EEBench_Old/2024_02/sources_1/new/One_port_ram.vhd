----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 17.11.2022 18:59:01
-- Design Name: 
-- Module Name: One_port_ram - Behavioral
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
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity One_port_ram is
  generic(
    ADDR_WIDTH: integer := 16;
    DATA_WIDTH: integer:= 16
   );
  port (
      clk: in std_logic;
      we: in std_logic;
      addr: in std_logic_vector(ADDR_WIDTH-1 downto 0);
      din: in std_logic_vector(DATA_WIDTH-1 downto 0);
      dout: out std_logic_vector(DATA_WIDTH-1 downto 0)
    );
end One_port_ram;
 
-- Ram_1K_by_16_0: Xilinx_one_port_ram_sync 
--  generic map(ADDR_WIDTH=>10;DATA_WIDTH=>16)
--  port map(clk => clk, we=>we,addr=>addr,din=>din,dout=>dout);
architecture Behavioral of One_port_ram is
      type ram_type is array (2**ADDR_WIDTH-1 downto 0) of
               std_logic_vector (DATA_WIDTH-1 downto 0);
      signal ram: ram_type:= (others => (others => '0')); 
    Begin
    process(clk)
     begin
      if ((clk'event) and clk='1') then
         if (we ='1') then
            ram(to_integer(unsigned(addr))) <= din;
         end if;
         dout <= ram(to_integer(unsigned(addr)));
      end if;
    end process;
    
    end Behavioral;

