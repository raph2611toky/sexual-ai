import { View, TextInput, Text, ScrollView, Image, StyleSheet, TouchableOpacity,Alert, Keyboard} from 'react-native';
import { Ionicons, FontAwesome, SimpleLineIcons, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/core';
import pdfIcon from './../assets/pdf.png';
import docxIcon from './../assets/docx.jpg';
import excelIcon from './../assets/excel.png';
import pptxIcon from './../assets/pptx.png';
import React, { useEffect, useState } from 'react';
import config from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Comment() {
  const [commentsList, setCommentsList] = useState([]);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [publication, setPublication] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { publicationId } = route.params;
  const [likes,setLikes] = useState(0)
  const [newComment,setNewComment] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        
        if (userDataString) {
          const userData = JSON.parse(userDataString);  
          const userToken = userData.id;  
          
          if (userToken) {
            
            const response = await axios.get(`${config.apiUrl}/publication/profile/${publicationId}/`,


              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                }
              }
            );
            setPublication(response.data);
            setCommentsList(response.data.comments);
        }

      }
      } catch {
        Alert.alert("Erreur", "Impossible de charger les publications.");
        console.error(error);
      }
    };

    fetchData();
    
  }, [newComment]);

  const handleLike = async(message_id)=>{
    try {

      const userDataString = await AsyncStorage.getItem('userData');
  
      if (userDataString) {
        const userData = JSON.parse(userDataString);  
        const userToken = userData.id;  
  
        if (userToken) {
          // const response = await axios.get(`${config.apiUrl}/discussion/list/`,
          const response = await axios.put(`${config.apiUrl}/message/like/${message_id}/`,{},
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              }
            }
          );
          const response_pub = await axios.get(`${config.apiUrl}/discussion/list/`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              }
            }
          );
  
          setPublications(response_pub.data || []);
        }

      }
  
    } catch (error) {
      Alert.alert("Erreur", error);
      console.error(error);
    }
  }
    
    const handleAddComment = async() =>{
      try{
        const userDataString = await AsyncStorage.getItem('userData');
  
        if (userDataString) {
          const userData = JSON.parse(userDataString);  
          const userToken = userData.id;  
    
          if (userToken) {
            const formData = new FormData();
            formData.append('contenu', newComment);
            formData.append('publicationF', publicationId);
            formData.append('is_anonymous', false)
            const response = await axios.post(`${config.apiUrl}/publication/new/comment/`,formData,
              {
                headers: {
                  Authorization: `Bearer ${userToken}`,
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
            setNewComment('');
          Keyboard.dismiss();
          alert('commentaire ajouté avec succès')
          }

        }
      }
      catch{
       
      }
  };

  const handleAnswerComment = (discussionId)=>{
    navigation.navigate('CommentAnswer', { discussionId });
  };

  return (
    <View style={styles.container}>
      {publication && (
         <View style={styles.publicationContainer}>
            <View style={styles.personContainer}>
              <Image source={{ uri: publication.sender['profile_url'] }} style={styles.personImage} />
              <Text style={styles.personName}>{publication.sender['name']}</Text>
            </View>
            
            {publication.contenu && (
              <Text style={styles.title}>{publication.contenu}</Text>
            )}
            {publication.images && publication.images.length > 0 && (
              <Image source={{ uri: publication.images[0].url }} style={styles.image} />
            )}
            {publication.files && publication.files.length > 0 && publication.files.map((file, index) => (
              <TouchableOpacity style={styles.fileContainer} key={index} onPress={() => openFile(file.url)}>
              <Text style={styles.fileName}>{file.name}</Text>
                {file.type === 'pdf' ? (
                  <Image source={pdfIcon} style={styles.fileIcon} />
                ) : file.type === 'docx' ? (
                  <Image source={docxIcon} style={styles.fileIcon} />
                ) : file.type === 'excel' ? (
                  <Image source={excelIcon} style={styles.fileIcon} />
                ) : file.type === 'pptx' ? (
                  <Image source={pptxIcon} style={styles.fileIcon} />
                ) : null}
                
              </TouchableOpacity>
            ))}
            

            {/* <View style={styles.interactionContainer}>
              <TouchableOpacity style={styles.reaction} onPress={() => handleLike(publication.publication.id_messageDF)}>
                <Ionicons 
                  name="heart"  
                  size={20} 
                  color={publication.publication.is_liked ? '#ff0000' : '#000000'}
                />
                <Text>{publication.publication.likes_number}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reaction} onPress={() => handleAnswerComment(publication.id_discussion_forum)}>
                <Ionicons name="chatbubble-outline" size={20} color="black" />
                <Text style={styles.commentButtonText}>{publication.comments_number} </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reaction} onPress={() => console.log('Partager')}>
                <FontAwesome name="share" size={20} color="blue" />
                
              </TouchableOpacity>
            </View> */}
          </View>
      )}
      <ScrollView style={styles.commentSection}>
       
        {commentsList.map((comment, index) => (
          <View key={index} style={styles.comment}>
            <Image source= {{uri: comment.sender['profile_url']}} style={styles.personImage}></Image>
            <View style={styles.commentsContainer}>
              <View style={styles.commentsNameTitle}>
              <Text style={styles.commentsName}>{comment.sender['name']} </Text>
              <Text style={styles.timeElapsed}>{comment.time_elapsed}</Text>
              </View>
              <Text style={styles.textComment}>{comment.first.contenu}</Text>
            </View>
            <View style={styles.reactions}>
              <TouchableOpacity style={styles.reactionButton} onPress={() => handleLike(comment.id_messageDF)}>
              
              {comment.is_liked ? (
                <AntDesign name="like1" size={17} color="#27b0a0"></AntDesign>
              ) : (
                <AntDesign name="like1" size={17} color="#000000"></AntDesign>
              )}
              <Text>{comment.likes_number}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reactionButton} onPress={() => handleAnswerComment(comment.discussion)}>
                <FontAwesome name='share' size={15}></FontAwesome>
                <Text>{comment.reply}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.commentForm}>
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Ajouter un commentaire"
        />
        
        <TouchableOpacity onPress={()=>handleAddComment()}>
          <Ionicons name="send" onPress={()=>handleAddComment()} style={styles.icones} size={24} color="orange" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 20,
        paddingVertical: 100,
      },
      scrollView: {
        flexGrow: 1,
        alignItems: 'center',
      },
      publicationContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 5,
        width: '100%',
        marginBottom:5
      },
      personContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      personImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
      },
      personName: {
        fontSize: 14,
      },
      image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
      },
      title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      interactionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      },
      reactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      container_tab: {
        backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
        margingTop: 25,
        marginBottom: 0, 
        backgroundColor: 'white'
      
    
    },
    profileContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
      marginRight: 10,
    },
    profileImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
      commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        color: 'blue',
      },
      commentButtonText: {
        fontSize: 12,
        color: 'blue',
        fontWeight: 'bold',
        marginLeft: 5,
      },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  publication: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  personImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  personName: {
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  fileContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIcon: {
    width: 290,
    height: 200,
    marginBottom:5,
    resizeMode: 'contain',
  },
  fileName: {
    marginRight: 260,
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentSection: {
    flex: 1,
  },
  comment: {
    padding: 9,
    borderWidth: 0.4,
    backgroundColor: '#f0f0f0',
    borderColor: 'white',
    borderRadius: 4,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactions:{
    flexDirection: 'row',
    width: '20%',
    justifyContent: 'space-around',
  },
  commentsContainer:{
    flexDirection: 'column',
    width: '65%',
    justifyContent: 'flex-start',
  },
  commentsName:{
    fontWeight: 'bold',
  },
  timeElapsed:{
    fontWeight: '100',
  },
  textComment: {
    flexWrap: 'wrap',
    color:'black'
  },
  commentsNameTitle:{
    flexDirection: 'row',
  },
  input: {

    flex: 1,
    marginRight: 10,
    padding: 20,
    borderRadius:5,
    position: 'absolute',
    width: '100%',
    backgroundColor:"white",
    margingTop: 20
  },
  icones:{
    left: 340
  },
  reaction: {
    borderColor:'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor:'white',
    padding: 7,
    width: '30%',
    alignItems:"center",
    justifyContent:'center',

  },
});

export default Comment;
