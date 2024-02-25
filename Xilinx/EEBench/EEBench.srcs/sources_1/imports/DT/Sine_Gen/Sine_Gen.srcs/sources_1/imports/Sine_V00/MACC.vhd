

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.STD_LOGIC_ARITH.ALL;
use IEEE.STD_LOGIC_UNSIGNED.ALL;
use IEEE.math_real.all;
entity MACC is
generic(
    width: natural := 26;
    width_plus: natural := 6
    );
port (
    CLK: in STD_LOGIC;                                          -- CLK 100 MHz
    RST: in STD_LOGIC;                                          -- RESET signal
    FCLK: in STD_LOGIC;                                         -- Enable CLK signal
    Step_Re: in STD_LOGIC_VECTOR(width+width_plus-1 downto 0);  -- sin(dphi) complex step
    Step_Im: in STD_LOGIC_VECTOR(width+width_plus-1 downto 0);  -- cos(phi)
    Step_Re1: in STD_LOGIC_VECTOR(width+width_plus-1 downto 0); -- sin(phi*256) complex coarse step
    Step_Im1: in STD_LOGIC_VECTOR(width+width_plus-1 downto 0); -- cos(phi*256)
    sample: in STD_LOGIC_VECTOR(22 downto 0);                   -- maximum 4M samples until repetition needs 22 bits
    mysine: out STD_LOGIC_VECTOR(width-1 downto 0)              -- output waveform (25 downto 0) 26bits
    );
end MACC;

architecture Behavioral of MACC is

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

-- current value
signal Curr_Re, Curr_Im: std_logic_vector(width-1 downto 0);  -- (25 downto 0)               26bit
signal Curr_Re1, Curr_Im1: std_logic_vector(width+width_plus-1 downto 0);  -- (25 downto 0)               26bit
-- precalculated next value
signal Curr_inter_Re, Curr_sine, Curr_inter_Im: std_logic_vector(width+width_plus-1 downto 0);  --    (31 downto 0)       32bits (width_plus =6)
-- step angle
signal Step_inter_Re, Step_inter_Im: std_logic_vector(width+width_plus-1 downto 0);  --    (31 downto 0)       32bits (width_plus =6)
-- output value
signal mysineX: STD_LOGIC_VECTOR(width+width_plus - 1 downto 0);    -- (31 downto 0)           32bits
signal offsetX: STD_LOGIC_VECTOR(width+width_plus - 1 downto 0);    --    (31 downto 0)       32bits (width_plus =6)
-- index of value
signal cnt: STD_LOGIC;  -- for internal signal
-- partial complex multiplication
signal multi_1, multi_2, multi_3, multi_4: signed(2*(width+width_plus)-1 downto 0);  -- (63 downto 0)      64bits (width_plus =6)
-- scaling of signal
signal offset_scale: signed(8 downto 0);
-- refresh count
signal refresh_cnt: signed(22 downto 0); -- integer
signal cntX: STD_LOGIC_VECTOR(7 downto 0);         -- !! Interpolating counter update if more interpolation !!

-- rounding helping numbers
signal rp, rm : signed(2*(width+width_plus)-1 downto 0); -- rounding numbers
signal rmh : signed( width + width_plus - 3 downto 0);

signal flagX: STD_LOGIC;

begin

-- multi_(1/2/3/4) = Step_inter_(Re/Im) * Curr_inter_(Re/Im)
pipe_mul1 : pipe_mul 
generic map(
    width =>26,
    width_plus =>6
)
port map(
    CLK =>CLK,
    RST =>RST,
    A =>Step_inter_Re,
    B =>Curr_inter_Re,
    C =>multi_1
);
pipe_mul2 : pipe_mul 
generic map(
    width =>26,
    width_plus =>6
)
port map(
    CLK =>CLK,
    RST =>RST,
    A =>Step_inter_Im,
    B =>Curr_inter_Im,
    C =>multi_2
);
pipe_mul3 : pipe_mul 
generic map(
    width =>26,
    width_plus =>6
)
port map(
    CLK =>CLK,
    RST =>RST,
    A =>Step_inter_Re,
    B =>Curr_inter_Im,
    C =>multi_3
);
pipe_mul4 : pipe_mul 
generic map(
    width =>26,
    width_plus =>6
)
port map(
    CLK =>CLK,
    RST =>RST,
    A =>Step_inter_Im,
    B =>Curr_inter_Re,
    C =>multi_4
);


process(clk,FCLk,RST,cnt)

variable multi_1t, multi_2t, multi_3t, multi_4t: signed(2*(width+width_plus) -1 downto 0);  -- (31 downto 0)      32bits (width_plus =6)
variable d_1, d_2, d_3, d_4: signed(width+width_plus -1 downto 0):= (others => '0');  -- (31 downto 0)      32bits (width_plus =6)
variable multi_1r, multi_2r, multi_3r, multi_4r: signed(width+width_plus -1 downto 0);  -- (31 downto 0)      32bits (width_plus =6)
variable multi_Re, multi_Im: signed(width+width_plus -1 downto 0);  -- (31 downto 0)      32bits (width_plus =6)
variable multi_Re_STD, multi_Im_STD: std_logic_vector(width+width_plus -1 downto 0);  -- (31 downto 0)      32bits (width_plus =6)
variable scale_multi : signed(width+width_plus +8 downto 0);
variable scale_trunc : signed(width+width_plus -1 downto 0);
variable mysineXV: signed(width+width_plus - 1 downto 0);  -- (31 downto 0)

begin
if (cnt='0') then
  -- internal signal
  Curr_inter_Re(width+width_plus-1 downto width_plus) <= Curr_Re;        -- 32bits (width_plus =6)
  Curr_inter_Im(width+width_plus-1 downto width_plus) <= Curr_Im;        -- 32bits (width_plus =6)
  Step_inter_Re <= Step_Re;
  Step_inter_Im <= Step_Im;
end if;
    if (rising_edge(clk)) then
        if (RST='1') then            -- Reset initialize
            Curr_Re <= (others => '0');
            Curr_Re (width - 2) <= '1';
            Curr_Re1 <= (others => '0');
            Curr_Re1 (width - 2) <= '1';
            Curr_Im <= (others => '0');
            Curr_Im1 <= (others => '0');
            offsetX <= (others => '0');
            offsetX(width+width_plus - 2) <= '1';
            offset_scale <= (others => '0');
            offset_scale(7 downto 0) <= (others => '1');
            Curr_inter_Re <= (others => '0');
            Curr_sine <= (others => '0');
            Curr_inter_Im <= (others => '0');
            cnt <= '0';
            flagX <= '0';
            rp <= (others => '0');          -- setting rounding plus
            rp (width+width_plus-2) <= '1'; -- 00..01000000
            rm (2*(width + width_plus) - 1 downto width + width_plus - 2) <= (others => '0');          -- 00..0111111
            rm (width + width_plus - 3 downto 0) <= (others => '1');
            refresh_cnt <= (others => '0');
        elsif (fclk='1') then
        
          cnt <= '1';
          refresh_cnt <= refresh_cnt+1;
        
          -- multiplication with rounding add and truncate
          -- multi_1 <= signed(Step_inter_Re) * signed(Curr_inter_Re);   --multiplication
          if ( multi_1(2*(width+width_plus)-2) = '0') then -- positive number
             multi_1t := multi_1 + rp;
          else                                         -- negativ number
             multi_1t := multi_1 + rm;
          end if;
          multi_1r := multi_1t(2*(width+width_plus)-2 downto width+width_plus-1);  --truncate 
             
        --multi_2 <= signed(Step_inter_Im) * signed(Curr_inter_Im);   --multiplication
        -- old multi_2t := multi_2(2*(width+width_plus)-2 downto width+width_plus-1);  --truncate
        -- old d_2 := d_2(width+width_plus -1 downto 1) & multi_2(width+width_plus-2); --increment
        -- old multi_2r := multi_2t + d_2; --rounding
          if ( multi_2(2*(width+width_plus)-2) = '0') then -- positive number
             multi_2t := multi_2 + rp;
          else                                         -- negativ number
             multi_2t := multi_2 + rm;
          end if;
          multi_2r := multi_2t(2*(width+width_plus)-2 downto width+width_plus-1);  --truncate 
        
          --multi_3 <= signed(Step_inter_Re) * signed(Curr_inter_Im);   --multiplication
          if ( multi_3(2*(width+width_plus)-2) = '0') then -- positive number
             multi_3t := multi_3 + rp;
          else                                         -- negativ number
             multi_3t := multi_3 + rm;
          end if;
          multi_3r := multi_3t(2*(width+width_plus)-2 downto width+width_plus-1);  --truncate 
        
          --multi_4 <= signed(Step_inter_Im) * signed(Curr_inter_Re);   --multiplication
          if ( multi_4(2*(width+width_plus)-2) = '0') then -- positive number
             multi_4t := multi_4 + rp;
          else                                         -- negativ number
             multi_4t := multi_4 + rm;
          end if;
          multi_4r := multi_4t(2*(width+width_plus)-2 downto width+width_plus-1);  --truncate 
        
          multi_Re := multi_1r - multi_2r;
          multi_Im := multi_3r + multi_4r;
                
          multi_Re_STD := std_logic_vector(multi_Re);
          multi_Im_STD := std_logic_vector(multi_Im);
                         
          Curr_inter_Re <= multi_Re_STD;        --overwrite internal value
          Curr_inter_Im <= multi_Im_STD;        --overwrite internal value   
          Curr_sine <= multi_Re_STD;
               
          scale_multi := signed(Curr_sine) * offset_scale;
          scale_trunc := scale_multi(width+width_plus - 1 + 8 downto 8);
          mysineXV := signed(scale_trunc) + signed(offsetX);  
          mysineX <= std_logic_vector(mysineXV);
          mysine <= mysineX(width+width_plus - 1 downto width_plus);
                   
          cntX <= std_logic_vector(refresh_cnt(7 downto 0));
                
          if (refresh_cnt = signed(sample)-1) then  ------------------ refresh_cnt= # of samples-1 start again
            Curr_inter_Re(width_plus-1 downto 0) <= (others => '0');
            Curr_inter_Im(width_plus-1 downto 0) <= (others => '0');
            Curr_inter_Re(width+width_plus-1 downto width_plus) <= Curr_Re;        -- 32bits (width_plus =6)
            Curr_inter_Im(width+width_plus-1 downto width_plus) <= Curr_Im;        -- 32bits (width_plus =6) 
            Curr_Re1 <= Curr_Re&"000000";
            Curr_Im1 <= Curr_Im&"000000";
          --elsif (refresh_cnt >= signed(sample)) then  ------------------  refresh_cnt = reset to zero
          elsif (refresh_cnt >= signed(sample)) then  ------------------  refresh_cnt = reset to zero
            refresh_cnt <= (others => '0');
            refresh_cnt(0) <='1';
          -- elsif (cntX = "11111111") then           -- in between interpolation
          --  Curr_inter_Re(width+width_plus-1 downto 0) <= Curr_Re1;        -- Big step value
          --  Curr_inter_Im(width+width_plus-1 downto 0) <= Curr_Im1;        --  
          --  Step_inter_Re <= Step_Re1;                                              -- Big step angle
          --  Step_inter_Im <= Step_Im1;
          elsif (cntX = "00000000") then      -- "00000000" matching to phi_export inter= 256
            Curr_Re1 <= multi_Re_STD;        -- Big step result
            Curr_Im1 <= multi_Im_STD;        --    
            Step_inter_Re <= Step_Re;                                              -- regular step angle
            Step_inter_Im <= Step_Im;
          end if;  -- correction end

        end if;   
        
    end if;

end process;
end Behavioral;