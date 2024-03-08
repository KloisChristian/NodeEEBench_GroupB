----------------------------------------------------------------------------
--	ButtonD.vhd -- Detect button on BASYS3
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

--The IEEE.std_logic_unsigned contains definitions that allow 
--std_logic_vector types to be used with the + operator to instantiate a 
--counter.
use IEEE.std_logic_unsigned.all;

entity ButtonD is
    Port ( BTN 			: in  STD_LOGIC_VECTOR (4 downto 0);   -- 5 Buttons
           CLK			: in  STD_LOGIC;
		   btnDeBnc     : out STD_LOGIC_VECTOR (4 downto 0);
		   btnDetect    : out STD_LOGIC
             );
end ButtonD;

architecture Behavioral of ButtonD is

component debouncer
Generic(
        DEBNC_CLOCKS : integer;
        PORT_WIDTH : integer);
Port(
		SIGNAL_I : in std_logic_vector(4 downto 0);
		CLK_I : in std_logic;          
		SIGNAL_O : out std_logic_vector(4 downto 0)
		);
end component;

-- Button signals and registers
--Used to determine when a button press has occured
signal btnReg : std_logic_vector (4 downto 0) := "00000";
signal btnRegX : std_logic_vector (4 downto 0) := "00000";

begin

--Debounces btn signals
Inst_btn_debounce: debouncer 
    generic map(
        DEBNC_CLOCKS => (2**16),
        PORT_WIDTH => 5)
    port map(
		SIGNAL_I => BTN,
		CLK_I => CLK,
		SIGNAL_O => btnRegX
	);

--Registers the debounced button signals, for edge detection.
btn_reg_process : process (CLK)
begin
	if (rising_edge(CLK)) then
		btnReg <= btnRegX;
	end if;
end process;

--btnDetect goes high for a single clock cycle when a btn press is
--detected. 
btnDetect <= '1' when ((btnReg(0)='0' and btnRegX(0)='1') or
					   (btnReg(1)='0' and btnRegX(1)='1') or
					   (btnReg(2)='0' and btnRegX(2)='1') or
					   (btnReg(3)='0' and btnRegX(3)='1') or
					   (btnReg(4)='0' and btnRegX(4)='1')  ) else
			 '0';
btnDeBnc <= btnRegX;
------         End  Button Control                 -------

end Behavioral;


