import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import config from './aws-exports';
import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button
} from 'react-native'
import { Todo } from './src/models';
import { withAuthenticator } from "aws-amplify-react-native";
import { DataStore } from 'aws-amplify';

Amplify.configure(config)

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    DataStore.clear().then(()=>{fetchTodos()});
    const subscription = DataStore.observe(Todo).subscribe(msg => {
      console.log(msg);
      fetchTodos();
    })
    console.log(subscription);
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todos = await DataStore.query(Todo);
      setTodos(todos)
      console.log("Todos retrieved successfully!", JSON.stringify(todos, null, 2));
    } catch (error) {
      console.log("Error retrieving todos", error);
    }
  }

  async function addTodo() {
    try {
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await DataStore.save(new Todo({...formState}) );
      console.log("Todo saved successfully!");
    } catch (error) {
      console.log("Error saving todo", error);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={val => setInput('name', val)}
        style={styles.input}
        value={formState.name} 
        placeholder="Name"
      />
      <TextInput
        onChangeText={val => setInput('description', val)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <Button title="Create Todo Fucker!" onPress={addTodo} />
      {
        todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text>{todo.description}</Text>
          </View>
        ))
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8 },
  todoName: { fontSize: 18 }
})

export default withAuthenticator(App);
