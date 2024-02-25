

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.STD_LOGIC_ARITH.ALL;
use IEEE.STD_LOGIC_UNSIGNED.ALL;
entity pipe_mul is
generic(
    width: natural := 26;
    width_plus: natural := 6
    ); 
port ( 
  CLK : in  std_logic;
  RST : in  std_logic;
  A : in  std_logic_vector(width+width_plus-1 downto 0);
  B : in  std_logic_vector(width+width_plus-1 downto 0);
  C : out signed((width+width_plus)*2-1 downto 0)
  );
end pipe_mul;
architecture Behavioral of pipe_mul is
-- A[31:0] = A[31:16] *2^16 + A[15:0] 
-- B[31:0] = B[31:16] *2^16 + B[15:0]
-- A[31:0] * B[31:0]= ( A[31:16] *2^16 + A[15:0] ) * ( B[31:16] *2^16 + B[15:0] )
-- = A[31:16] * B[31:16] *2^32  + (A[31:16] * B[15:0] + A[15:0] x B[31:16] ) *2^16 + A[15:0] * B[15:0]

signal sum_1 :signed((width+width_plus)*2 -1 downto 0);       --64bit
--signal multi_1 :signed(width+width_plus-1 downto 0);       --32bit
--signal multi_2, multi_3 :signed(width+width_plus downto 0);       --33bit
--signal multi_4 :signed(width+width_plus+1 downto 0);       --34bit
begin
      
        
C <=(sum_1);
    
process(CLK,RST)
variable A_upper, B_upper :signed((width+width_plus)/2-1 downto 0);   --16bit
variable A_lower, B_lower :signed((width+width_plus)/2 downto 0);   --17bit
variable multi_1 :signed(width+width_plus-1 downto 0);       --32bit
variable multi_2, multi_3 :signed(width+width_plus downto 0);       --33bit
variable multi_4 :signed(width+width_plus+1 downto 0);       --34bit
variable add_1 :signed((width+width_plus)*2 -1 downto 0);       --64bit
variable add_2, add_3 :signed(width+width_plus + (width+width_plus)/2 downto 0);       --49bit
variable add_4 :signed(width+width_plus +1 downto 0);       --34bit


begin
if(CLK'event and CLK='1') then
    if(RST='1') then
    
        A_upper := (others=>'0');
        A_lower := (others=>'0');
        B_upper := (others=>'0');
        B_lower := (others=>'0');
        multi_1 := (others=>'0');
        multi_2 := (others=>'0');
        multi_3 := (others=>'0');
        multi_4 := (others=>'0');
        add_1 := (others=>'0');
        add_2 := (others=>'0');
        add_3 := (others=>'0');
        add_4 := (others=>'0');
        sum_1 <= (others=>'0');
        
    else
        A_upper := signed(A(31 downto 16));
        A_lower := signed('0'&A(15 downto 0));
        B_upper := signed(B(31 downto 16));
        B_lower := signed('0'&B(15 downto 0));
        
        multi_1 := A_upper * B_upper;   --  need to multiply (2**32)
        multi_2 := A_upper * B_lower;   --  need to multiply (2**16)
        multi_3 := A_lower * B_upper;   --  need to multiply (2**16)
        multi_4 := A_lower * B_lower;
        
        add_1((width+width_plus)*2 -1 downto width+width_plus) := multi_1;
        -- add_1(width+width_plus -1 downto 0) := (others=>'0'); 
        add_2(width+width_plus + (width+width_plus)/2 downto (width+width_plus)/2) := multi_2;
        -- add_2((width+width_plus)/2 -1 downto 0) := (others=>'0'); 
        add_3(width+width_plus + (width+width_plus)/2 downto (width+width_plus)/2) := multi_3;
        -- add_3((width+width_plus)/2 -1 downto 0) := (others=>'0'); 
        add_4 := multi_4;
        sum_1 <= add_1 + add_2 + add_3 + add_4;
        
    end if;
end if;
end process;
end Behavioral;