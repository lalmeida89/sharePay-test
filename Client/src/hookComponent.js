import React, {useState, useEffect} from 'react';

export function HookExample(){
  const [post, changePost] = useState('');
  const [response, changeResponse] = useState('');
  const [responseToPost, changeResponseToPost] = useState('');

  useEffect(() => {
    callApi()
      .then(res => changeResponse(res.express))
      .catch(err => console.error(err));
  })

  async function callApi(){
    const response = await fetch('/api/hello');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await fetch('/api/world', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({post}),
    });
    const body = await response.text();
    changeResponseToPost(body);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <p> {response} </p>
        <p><strong> Post to server: </strong></p>
        <input
          type='text'
          value={post}
          onChange={(e)=> changePost(e.target.value)}
        />
        <button type='submit'> Submit </button>
      </form>
      <p>{responseToPost}</p>
    </div>
  )
}
