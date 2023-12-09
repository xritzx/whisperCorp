import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useGlobalState } from '~~/services/store/store';

const Dropdown = () => {

  const options = [
    { label: "📺 Misc", value: "📺 Misc" },
    { label: "💰 Compensation", value: "💰 Compensation " },
    { label: "📣 WhistleBlow", value: "📣 WhistleBlow" },
    { label: "👔 StartUps", value: "👔 StartUps" },
    { label: "🥾 Layoff", value: "🥾 Layoff" },
    { label: "₿ Web3", value: "₿ Web3" },
  ];
  const {category, setCategory} = useGlobalState();


  const handleChange = (event: any) => {
    setCategory(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">Topic</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={category as any}
        label="Topic"
        defaultValue={options[0]}
        onChange={handleChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default Dropdown;
