import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import moment from 'moment-timezone';
import './index.scss';
import { imageUrlArr, LogoArr } from './Arrays.js';

function Json() {
  const initialData = {
    "group": "",
    "desc": "",
    "chain": "solana",
    "category": "",
    "image": "",
    "endAt": null,
  };

  const initialEvent = {
    "title": "",
    "content": "",
    "star": null,
    "left": {
      "name": "",
      "logo": ""
    },
    "right": {
      "name": "",
      "logo": ""
    }
  };

  const [data, setData] = useState(initialData);
  const [eventsData, setEventsData] = useState(Array(10).fill(null).map(() => ({ ...initialEvent })));
  const [imageSuggestions, setImageSuggestions] = useState([]);
  const [logoSuggestions, setLogoSuggestions] = useState({});

  const handleChange = (path, value) => {
    setData(prevData => {
      const new_data = { ...prevData };
      let current = new_data;
      const path_array = path.split('.');

      for (let i = 0; i < path_array.length - 1; i++) {
        current = current[path_array[i]];
      }

      current[path_array[path_array.length - 1]] = value;
      return new_data;
    });

    if (path === 'image') {
      handleImageSearch(value);
    }
  };

  const handleEventChange = (index, path, value) => {
    setEventsData(prevEvents => {
      const newEvents = prevEvents.map((event, i) => {
        if (i === index) {
          const newEvent = JSON.parse(JSON.stringify(event));
          let current = newEvent;
          const path_array = path.split('.');

          for (let j = 0; j < path_array.length - 1; j++) {
            current = current[path_array[j]];
          }

          // 特殊处理 content 字段
          if (path === 'content') {
            // 检查字符串是否以英文句号结尾
            if (value.endsWith('.')) {
              // 在末尾添加 <br/><br/>
              value = value + '<br/><br/>';
            }
          }

          current[path_array[path_array.length - 1]] = value;
          return newEvent;
        } else {
          return event;
        }
      });
      return newEvents;
    });

    if (path === 'left.logo' || path === 'right.logo') {
      handleLogoSearch(index, path, value);
    }
  };

  const handleEndAtChange = (value) => {
    try {
      const format = "MMMM DD h:mm A UTC";
      const cleanInput = value.replace('UTC', '').trim();
      const fullInput = `${cleanInput} 2025`;
      const utcTime = moment.tz(fullInput, "MMMM DD h:mm A YYYY", "UTC");
      if (!utcTime.isValid()) {
        throw new Error("无效的时间格式");
      }
      const atlanticCanaryTime = utcTime.clone().tz('Atlantic/Canary', true);
      const timestamp = atlanticCanaryTime.valueOf();
      setData(prevData => ({ ...prevData, endAt: timestamp }));
    } catch (error) {
      console.error("时间转换错误:", error);
    }
  };

  const handleImageSearch = (value) => {
    if (!value) {
      setImageSuggestions([]);
      return;
    }

    const filteredSuggestions = imageUrlArr.filter(link =>
      link.toLowerCase().includes(value.toLowerCase())
    );
    setImageSuggestions(filteredSuggestions);
  };

  const handleLogoSearch = (index, path, value) => {
    if (!value) {
      setLogoSuggestions(prev => ({ ...prev, [`${index}-${path}`]: [] }));
      return;
    }

    const filteredSuggestions = LogoArr.filter(link =>
      link.toLowerCase().includes(value.toLowerCase())
    );
    setLogoSuggestions(prev => ({ ...prev, [`${index}-${path}`]: filteredSuggestions }));
  };

  const handleSuggestionClick = (suggestion) => {
    handleChange('image', suggestion);
    setImageSuggestions([]);
  };

  const handleLogoSuggestionClick = (index, path, suggestion) => {
    handleEventChange(index, path, suggestion);
    setLogoSuggestions(prev => ({ ...prev, [`${index}-${path}`]: [] }));
  };

  const handleDownload = (e) => {
    e.preventDefault();
    const filteredEvents = eventsData.filter(event => event.title !== "");
    const jsonData = {
      ...data,
      events: filteredEvents
    };
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, 'data.json');
    window.location.reload();
    window.scrollTo(0, 0);
  };

  return (
    <div className="app-container">
      <h1>JSON Editor</h1>
      <form>
        <fieldset>
          <legend>General Information</legend>
          <div className="form-group">
            <label htmlFor="group">Group:</label>
            <input
              type="text"
              id="group"
              value={data.group}
              onChange={e => handleChange('group', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="desc">Description:</label>
            <input
              type="text"
              id="desc"
              value={data.desc}
              onChange={e => handleChange('desc', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="chain">Chain:</label>
            <select
              id="chain"
              value={data.chain}
              onChange={e => handleChange('chain', e.target.value)}
            >
              <option value="solana">solana</option>
              <option value="abstract">abstract</option>
            </select> 
          </div>
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <input
              type="text"
              id="category"
              value={data.category}
              onChange={e => handleChange('category', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Image URL:</label>
            <div className='img'>
              <img src={data.image} alt="" />
            </div>
            <input
              type="text"
              id="image"
              value={data.image}
              onChange={e => handleChange('image', e.target.value)}
              autoComplete="off"
            />
            {imageSuggestions.length > 0 && (
              <ul className="suggestions">
                {imageSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="suggestion-item"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="endAt">End At:</label>
            <input
              type="text"
              id="endAt"
              value={typeof data.endAt === 'number' ? moment(data.endAt).tz('Atlantic/Canary').format('MMMM DD YYYY hh:mm A UTC') : ""}
              onChange={e => handleEndAtChange(e.target.value)}
              autoComplete="off"
            />
          </div>
        </fieldset>
        <fieldset>
          <legend>Events</legend>
          {eventsData.map((event, index) => (
            <div key={index} className="event-container">
              <h3>Event {index + 1}</h3>
              <div className="form-group">
                <label htmlFor={`event-${index}-title`}>Title:</label>
                <input
                  type="text"
                  id={`event-${index}-title`}
                  value={event.title}
                  onChange={e => handleEventChange(index, 'title', e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`event-${index}-content`}>Content:</label>
                <input
                  type="text"
                  id={`event-${index}-content`}
                  value={event.content}
                  onChange={e => handleEventChange(index, 'content', e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`event-${index}-star`}>Star:</label>
                <input
                  type="number"
                  id={`event-${index}-star`}
                  value={event.star ?? ""}
                  onChange={e => handleEventChange(index, 'star', parseInt(e.target.value))}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor={`event-${index}-left-name`}>Left Name:</label>
                <input
                  type="text"
                  id={`event-${index}-left-name`}
                  value={event.left.name}
                  onChange={e => handleEventChange(index, 'left.name', e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`event-${index}-left-logo`}>Left Logo:</label>
                <div className='img'>
                  <img src={event.left.logo} alt="" />
                </div>
                <input
                  type="text"
                  id={`event-${index}-left-logo`}
                  value={event.left.logo}
                  onChange={e => handleEventChange(index, 'left.logo', e.target.value)}
                  autoComplete="off"
                />
                {logoSuggestions[`${index}-left.logo`]?.length > 0 && (
                  <ul className="suggestions">
                    {logoSuggestions[`${index}-left.logo`].map((suggestion, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleLogoSuggestionClick(index, 'left.logo', suggestion)}
                        className="suggestion-item"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label htmlFor={`event-${index}-right-name`}>Right Name:</label>
                <input
                  type="text"
                  id={`event-${index}-right-name`}
                  value={event.right.name}
                  onChange={e => handleEventChange(index, 'right.name', e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`event-${index}-right-logo`}>Right Logo:</label>
                <div className='img'>
                  <img src={event.right.logo} alt="" />
                </div>
                <input
                  type="text"
                  id={`event-${index}-right-logo`}
                  value={event.right.logo}
                  onChange={e => handleEventChange(index, 'right.logo', e.target.value)}
                  autoComplete="off"
                />
                {logoSuggestions[`${index}-right.logo`]?.length > 0 && (
                  <ul className="suggestions">
                    {logoSuggestions[`${index}-right.logo`].map((suggestion, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleLogoSuggestionClick(index, 'right.logo', suggestion)}
                        className="suggestion-item"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </fieldset>
        <button type="button" onClick={handleDownload}>Download JSON</button>
      </form>
    </div>
  );
}

export default Json;