import React, { useState } from "react"
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from '@react-navigation/core';
import axios from "axios";
import config from './config';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';


export default function Home() {

  const [publications, setPublications] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [images, setImages] = useState([]);
  const navigation = useNavigation();
  const [showOptions, setShowOptions] = useState(false);
  const fetchPublications = async () => {
    try {

      const userDataString = await AsyncStorage.getItem('userData');
  
      if (userDataString) {
        const userData = JSON.parse(userDataString);  
        const userToken = userData.id;  
  
        if (userToken) {
        
          const response = await axios.get(`${config.apiUrl}/publication/list/`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              }
            }
          );
  
          setPublications(response.data || []);
          console.log(publications)
        }

      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les publications.");
      console.error(error);
    }
  };
  useEffect(() => {
    fetchPublications()
  }, []);
  const handlePost = async () => {
    if (newPost.trim() === "") {
      Alert.alert("Erreur", "Le contenu ne peut pas être vide !");
      return;
    }
  
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const userData = JSON.parse(userDataString);
      const userToken = userData?.id;
  
      const formData = new FormData();
      formData.append("contenu", newPost);
      
      images.forEach((image, index) => {
        const type = getTypeFromExtension(image);
        formData.append('images', { uri: image, name: `image.${type}`, type });
        console.log(image)
      });

      attachments.forEach((file, index) => {
        formData.append("files", {
          uri: file.uri,
          type: file.type,
          name: file.name || `attachment_${index}`,
        });
      });
  
      const response = await axios.post(
        `${config.apiUrl}/publication/new/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "content-Type": "multipart/form-data",
          },
        }
      );
  
      fetchPublications()
      setNewPost("");
      setAttachments([]);
      setShowOptions(false);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer la publication.");
      console.error(error);
    }
  };
  
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      setAttachments((prev) => [
        ...prev,
        { uri: result.assets[0].uri, type: "video/mp4", name: "video.mp4" },
      ]);
    }
  };
  
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true });
  
    if (result.type === "success") {
      setAttachments((prev) => [
        ...prev,
        { uri: result.uri, type: result.mimeType, name: result.name },
      ]);
    }
  };
  
  const openFile = (url) => {
    Linking.openURL(url);
  };

  const handleLike = async(publicationId)=>{
    try {

      const userDataString = await AsyncStorage.getItem('userData');
  
      if (userDataString) {
        const userData = JSON.parse(userDataString);  
        const userToken = userData.id;  
  
        if (userToken) {
          const response = await axios.put(`${config.apiUrl}/publication/like/${publicationId}/`,{},
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              }
            }
          );
          const response_pub = await axios.get(`${config.apiUrl}/publication/list/`,
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

  const handleDislike = async(publicationId)=>{
    try {

      const userDataString = await AsyncStorage.getItem('userData');
  
      if (userDataString) {
        const userData = JSON.parse(userDataString);  
        const userToken = userData.id;  
  
        if (userToken) {
          const response = await axios.put(`${config.apiUrl}/publication/dislike/${publicationId}/`,{},
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              }
            }
          );
          const response_pub = await axios.get(`${config.apiUrl}/publication/list/`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              }
            }
          );
  
          setPublications(response_pub.data || []);
          console.log(publications)

        }

      }
  
    } catch (error) {
      Alert.alert("Erreur", error);
      console.error(error);
    }
  }
  
  const handleComment = async(discussionId)=>{
    navigation.navigate('Comment', { publicationId:discussionId });
  }
  const getTypeFromExtension = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'pdf':
        return 'application/pdf';
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'video/mp4';
      default:
        return Platform.OS === 'ios' ? 'application/octet-stream' : 'application/*';
    }
  };
  return (
    <View style={styles.container}>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Exprimez-vous ici..."
          value={newPost}
          onChangeText={setNewPost}
          onFocus={() => setShowOptions(true)}
        />
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <LinearGradient
            colors={["#FF7F50", "#FF1493"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.postButtonText}>Poster</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      
      {showOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handlePickImage}
          >
            <Ionicons name="image-outline" size={24} color="#FF6347" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handlePickVideo}
          >
            <Ionicons name="videocam-outline" size={24} color="#FF6347" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handlePickFile}
          >
            <Ionicons name="document-outline" size={24} color="#FF6347" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handlePickFile}
          >
            <Text style={styles.title}>anonyme</Text>
          </TouchableOpacity>
        </View>
      )}


    
      <ScrollView contenuContainerStyle={styles.scrollView}>
        {publications.map((publication) => (
          <View key={publication.id_publication_forum} style={styles.publicationContainer}>
              <View style={styles.personContainer}>
                <Image
                  source={{ uri: publication.sender.profile_url }}
                  style={styles.personImage}
                />
                <Text style={styles.personName}>{publication.sender.name}</Text>
              </View>
            {publication.contenu && (
              <Text style={styles.title}>{publication.contenu}</Text>
            )}
            {publication?.images?.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  <Image
                    source={{ uri: publication.images[0].url }} 
                    style={styles.imageStyle}
                  />
                </View>
              )}      
            
            {publication?.files?.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {publication.files.map((file, index) => (
                  <Text
                    key={index}
                    style={styles.attachmentText}
                    onPress={() => openFile(file.url)}
                  >
                    {file.name}
                  </Text>
                ))}
            
              </View>
            )}

            <View style={styles.interactionContainer}>
              <TouchableOpacity
                style={styles.reactionButton}
                onPress={() => handleLike(publication.id_publication_forum)}
              >
                <Ionicons
                  name="heart"
                  size={20}
                  color={publication.is_liked ? "#FF6347" : "#000"}
                />
                <Text style={styles.reactionText}>{publication.likes_number}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reactionButton}
                onPress={() => handleDislike(publication.id_publication_forum)}
              >
                <Ionicons
                  name="thumbs-down"
                  size={20}
                  color={publication.is_disliked ? "#FF6347" : "#000"}
                />
                <Text style={styles.reactionText}>{publication.dislikes_number}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reactionButton} onPress={()=>handleComment(publication.id_publication_forum)}>
                <Ionicons name="chatbubble-outline" size={20} color="#FF6347" />
                <Text style={styles.reactionText}>{publication.comments.length}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingHorizontal:5 },
  inputContainer: { flexDirection: "row", padding: 18 },
  input: {
    flex: 1,
    paddingVertical: 17, 
    paddingHorizontal: 10 ,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: "white",
  },
  gradientButton: { borderRadius: 5, paddingVertical: 7, paddingHorizontal: 10,marginTop:10 },
  postButton: { justifycontenu: "center", alignItems: "center" },
  postButtonText: { color: "#FFF", fontWeight: "bold" },
  optionsContainer: { flexDirection: "row", marginVertical: 10 },
  optionButton: { marginHorizontal: 10 },
  attachmentsContainer: { marginVertical: 10 },
  attachmentText: { color: "#007BFF", textDecorationLine: "underline" },
  scrollView: { padding: 10 },
  publicationContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: "#EEE",
    borderWidth: 1,
    marginHorizontal: 10
  },
  personContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  personImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  personName: { fontWeight: "bold" },
  title: { fontSize: 16, marginBottom: 10 },
  interactionContainer: {
    flexDirection: "row",
    justifycontenu: "space-around",
    marginTop: 10,
    gap:20

  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:'#F0f0f0',
    padding:8,
    paddingHorizontal:20,
    borderRadius: 10,
    marginRight: 42
  },
  reactionText: {
    color: "#333",
    fontSize: 14,
    marginLeft: 5,
  },
  imageStyle:{
        width: 100,
        height: 50
  }
});
