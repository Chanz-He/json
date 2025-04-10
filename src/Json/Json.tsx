import React, { useState} from 'react';
import { saveAs } from 'file-saver';
import moment from 'moment-timezone';
import './index.scss';
import { imageUrlArr, LogoArr } from './Arrays.tsx';
import swpPng from '../images/swp.png';

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
  const [tempContent, setTempContent] = useState({});

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

          if (path === 'left.logo') {
            if (value === 'https://cdn.zarlk.com/swipooor/images/events/event3/No.png') {
              newEvent.left.name = 'No';
            } else if (value === 'https://cdn.zarlk.com/swipooor/images/events/event3/Under.png') {
              newEvent.left.name = 'Under';
            }
          }

          if (path === 'right.logo') {
            if (value === 'https://cdn.zarlk.com/swipooor/images/events/event3/Yes.png') {
              newEvent.right.name = 'Yes';
            } else if (value === 'https://cdn.zarlk.com/swipooor/images/events/event3/Over.png') {
              newEvent.right.name = 'Over';
            }
          }

          if (path === 'content' && value) {
            if (!newEvent.content) {
              current[path_array[path_array.length - 1]] = value;
            } else {
              current[path_array[path_array.length - 1]] = `${newEvent.content}<br/><br/>${value}`;
            }
          } else if (path !== 'content') {
            current[path_array[path_array.length - 1]] = value;
          }

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
      setImageSuggestions(imageUrlArr);
      return;
    }
    const filteredSuggestions = imageUrlArr.filter(link =>
      link.toLowerCase().includes(value.toLowerCase())
    );
    setImageSuggestions(filteredSuggestions);
  };

  const handleLogoSearch = (index, path, value) => {
    if (!value) {
      setLogoSuggestions(prev => ({
        ...prev,
        [`${index}-${path}`]: LogoArr
      }));
      return;
    }
    const filteredSuggestions = LogoArr.filter(link =>
      link.toLowerCase().includes(value.toLowerCase())
    );
    setLogoSuggestions(prev => ({
      ...prev,
      [`${index}-${path}`]: filteredSuggestions
    }));
  };

  const handleSuggestionClick = (suggestion) => {
    handleChange('image', suggestion);
    setImageSuggestions([]);
  };

  const handleLogoSuggestionClick = (index, path, suggestion) => {
    handleEventChange(index, path, suggestion);
    setLogoSuggestions(prev => ({ ...prev, [`${index}-${path}`]: [] }));
  };

  const handleStarClick = (index, rating) => {
    setEventsData(prevEvents => {
      const newEvents = [...prevEvents];
      newEvents[index] = {
        ...newEvents[index],
        star: rating
      };
      return newEvents;
    });
  };

  const handleDownload = (e) => {
    e.preventDefault();

    const incompleteEvents = eventsData
      .map((event, index) => {
        const fields = {
          title: event.title,
          content: event.content,
          star: event.star,
          'left.name': event.left.name,
          'left.logo': event.left.logo,
          'right.name': event.right.name,
          'right.logo': event.right.logo
        };

        const filledFields = Object.entries(fields).filter(([key, value]) => {
          if (key === 'star') {
            return value !== null && value !== undefined;
          }
          return value !== "" && value !== null && value !== undefined;
        }).length;

        const isCompletelyEmpty = filledFields === 0;
        const isCompletelyFilled = filledFields === Object.keys(fields).length;

        if (!isCompletelyEmpty && !isCompletelyFilled) {
          return index + 1;
        }
        return null;
      })
      .filter(index => index !== null);

    if (incompleteEvents.length > 0) {
      const eventNumbers = incompleteEvents.join(', ');
      alert(`Not completed: Event ${eventNumbers}`);
      return;
    }

    const filteredEvents = eventsData.filter(event => {
      const fields = [
        event.title,
        event.content,
        event.star,
        event.left.name,
        event.left.logo,
        event.right.name,
        event.right.logo
      ];
      return fields.some(field => field !== "" && field !== null && field !== undefined);
    });

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

  const handleImageFocus = () => {
    if (!data.image) {
      setImageSuggestions(imageUrlArr);
    }
  };

  const handleImageBlur = () => {
    setTimeout(() => {
      setImageSuggestions([]);
    }, 150);
  };

  const handleLogoFocus = (index, path) => {
    const currentValue = path === 'left.logo' ? eventsData[index].left.logo : eventsData[index].right.logo;
    if (!currentValue) {
      setLogoSuggestions(prev => ({
        ...prev,
        [`${index}-${path}`]: LogoArr
      }));
    }
  };

  const handleLogoBlur = (index, path) => {
    setTimeout(() => {
      setLogoSuggestions(prev => ({
        ...prev,
        [`${index}-${path}`]: []
      }));
    }, 150);
  };
  const handleDeleteSentence = (eventIndex, sentenceIndex) => {
    setEventsData(prevEvents => {
      const newEvents = prevEvents.map((event, i) => {
        if (i === eventIndex) {
          const newEvent = JSON.parse(JSON.stringify(event));
          const sentences = newEvent.content ? newEvent.content.split('<br/><br/>') : [];
          sentences.splice(sentenceIndex, 1);
          newEvent.content = sentences.length > 0 ? sentences.join('<br/><br/>') : '';
          return newEvent;
        }
        return event;
      });
      return newEvents;
    });
  };

  return (
    <div className="app-container">
      <h1>JSON Editor</h1>
      <form>
        <fieldset className='fieldset1'>
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
              <img src={data.image ? data.image : swpPng} alt="" />
            </div>
            <input
              type="text"
              id="image"
              value={data.image}
              onChange={e => handleChange('image', e.target.value)}
              autoComplete="off"
              onFocus={handleImageFocus}
              onBlur={handleImageBlur}
            />
            {imageSuggestions.length > 0 && (
              <ul className="suggestions">
                {imageSuggestions.map((suggestion, index) => (
                  <div className='imglink' key={index}>
                    <img src={suggestion} alt="" />
                    <li
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-item"
                    >
                      {suggestion}
                    </li>
                  </div>
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
        <fieldset className='fieldset2'>
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
                  value={tempContent[index] || ''}
                  onChange={e => {
                    const inputValue = e.target.value;
                    setTempContent(prev => ({ ...prev, [index]: inputValue }));
                    if (inputValue) {
                      handleEventChange(index, 'content', inputValue.trim());
                      setTempContent(prev => ({ ...prev, [index]: '' })); // 清空输入框
                    }
                  }}
                  autoComplete="off"
                  placeholder="输入一句，自动生成"
                />
                <div>
                  {event.content ? event.content.split('<br/><br/>').map((sentence, idx) => (
                    <div className='content-preview1' key={idx}>
                      <div>{sentence}</div>
                      <div
                        className='x'
                        onClick={() => handleDeleteSentence(index, idx)}
                      >
                        x
                      </div>
                    </div>
                  )) : null}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor={`event-${index}-star`}>Star:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= (event.star || 0) ? 'star filled' : 'star'}
                      onClick={() => handleStarClick(index, star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor={`event-${index}-left-logo`}>Left Logo:</label>
                <div className='img'>
                  <img src={event.left.logo ? event.left.logo : swpPng} alt="" />
                </div>
                <input
                  type="text"
                  id={`event-${index}-left-logo`}
                  value={event.left.logo}
                  onChange={e => handleEventChange(index, 'left.logo', e.target.value)}
                  autoComplete="off"
                  onFocus={() => handleLogoFocus(index, 'left.logo')}
                  onBlur={() => handleLogoBlur(index, 'left.logo')}
                />
                {logoSuggestions[`${index}-left.logo`]?.length > 0 && (
                  <ul className="suggestions">
                    {logoSuggestions[`${index}-left.logo`].map((suggestion, idx) => (
                      <div className='imglink' key={idx}>
                        <img src={suggestion} alt="" />
                        <li
                          onClick={() => handleLogoSuggestionClick(index, 'left.logo', suggestion)}
                          className="suggestion-item"
                        >
                          {suggestion}
                        </li>
                      </div>
                    ))}
                  </ul>
                )}
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
                <label htmlFor={`event-${index}-right-logo`}>Right Logo:</label>
                <div className='img'>
                  <img src={event.right.logo ? event.right.logo : swpPng} alt="" />
                </div>
                <input
                  type="text"
                  id={`event-${index}-right-logo`}
                  value={event.right.logo}
                  onChange={e => handleEventChange(index, 'right.logo', e.target.value)}
                  autoComplete="off"
                  onFocus={() => handleLogoFocus(index, 'right.logo')}
                  onBlur={() => handleLogoBlur(index, 'right.logo')}
                />
                {logoSuggestions[`${index}-right.logo`]?.length > 0 && (
                  <ul className="suggestions">
                    {logoSuggestions[`${index}-right.logo`].map((suggestion, idx) => (
                      <div className='imglink' key={idx}>
                        <img src={suggestion} alt="" />
                        <li
                          onClick={() => handleLogoSuggestionClick(index, 'right.logo', suggestion)}
                          className="suggestion-item"
                        >
                          {suggestion}
                        </li>
                      </div>
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
            </div>
          ))}
        </fieldset>
        <button type="button" onClick={handleDownload}>Download JSON</button>
      </form>
    </div>
  );
}

export default Json;