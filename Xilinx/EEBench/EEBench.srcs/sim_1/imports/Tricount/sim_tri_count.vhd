----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 11.10.2022 10:26:02
-- Design Name: 
-- Module Name: sim_tri_count - Behavioral
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

-- Uncomment the following library declaration if using
-- arithmetic functions with Signed or Unsigned values
--use IEEE.NUMERIC_STD.ALL;

-- Uncomment the following library declaration if instantiating
-- any Xilinx leaf cells in this code.
--library UNISIM;
--use UNISIM.VComponents.all;

entity sim_tri_count is
--  Port ( );
end sim_tri_count;

architecture Behavioral of sim_tri_count is
Component tri_counter
   generic(
      N: integer := 16     -- number of bits
  );
   port(
      clk, reset: in std_logic;
      start, stop, step: in std_logic_vector(N-1 downto 0);
      repeat: in std_logic_vector(2*N-1 downto 0);
      q: out std_logic_vector(N-1 downto 0)
   );
end component;

signal clk, reset: std_logic;
signal start: std_logic_vector(15 downto 0) := "0000001100101000";
signal stop: std_logic_vector(15 downto 0) := "0000001100101100";
signal step: std_logic_vector(15 downto 0) := "0000000000000001";
signal repeat: std_logic_vector(31 downto 0) := "00000000000000000000000000000001";
signal q: std_logic_vector(15 downto 0);
 
   -- Clock period definitions
   constant clk_period : time := 10 ns;

begin

	-- Instantiate the Unit Under Test (UUT)
   uut: tri_counter PORT MAP (
          clk => clk,
          reset => reset,
          start => start,
          step => step,
          stop => stop,
          repeat => repeat,
          q => q
        );

   -- Clock process definitions
   clk_process :process
   begin
		clk <= '0';
		wait for clk_period/2;
		clk <= '1';
		wait for clk_period/2;
   end process;
 

   -- Stimulus process
   stim_proc: process
   begin		
     reset <= '1';  
     wait for 100 ns; 
     reset <= '0';     -- up down count
     wait for 400 ns; 
     stop <= start;    -- single value
     reset <= '1';  
     wait for 50 ns; 
     reset <= '0';     -- up down count
     wait for 50 ns; 
     wait for 500 ns; 
     stop <= "0000001100101100";
     repeat <= "00000000000000000000000000000011"; -- 3 repeat
     reset <= '1';  
     wait for 50 ns; 
     reset <= '0';     -- up down count
     wait for 50 ns; 
     wait for 500 ns; 
     step <= "0000000000000011"; -- step different
     reset <= '1';  
     wait for 50 ns; 
     reset <= '0';     -- up down count
     wait for 50 ns; 
     wait for 500 ns; 
     stop <= "0000001100111000"; -- bigger range
     reset <= '1';  
     wait for 50 ns; 
     reset <= '0';     -- up down count
     wait for 50 ns; 
     wait for 500 ns; 
     step <= "0000000000100000"; -- rectangle ?
     stop <= "0000110011100000"; -- bigger range
     reset <= '1';  
     wait for 50 ns; 
     reset <= '0';     -- up down count
     wait for 50 ns; 
     wait for 500 ns; 
    wait;

   end process;

end Behavioral;
