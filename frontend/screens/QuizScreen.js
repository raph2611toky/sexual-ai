import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
const QuizScreen = () => {
  // Liste des catégories de quiz et leurs questions
  const quizCategories = [
    {
      id: 1,
      title: "Grossesse",
      image: require("../assets/grossesse.png"),
      questions: [
        { question: "Combien de mois dure une grossesse ?", options: ["6", "9", "12"], correctAnswer: 1 },
        { question: "Quel aliment est conseillé pendant la grossesse ?", options: ["Alcool", "Légumes", "Café"], correctAnswer: 1 },
        { question: "Quand commence le troisième trimestre ?", options: ["6 mois", "3 mois", "9 mois"], correctAnswer: 0 },
        { question: "Quel nutriment est essentiel pour le bébé ?", options: ["Calcium", "Graisses", "Sucres"], correctAnswer: 0 },
        { question: "Quelle position est recommandée pour dormir enceinte ?", options: ["Sur le ventre", "Sur le dos", "Sur le côté"], correctAnswer: 2 },
        { question: "Quel test détecte une grossesse ?", options: ["Test sanguin", "IRM", "Rayon X"], correctAnswer: 0 },
      ],
    },
    {
      id: 2,
      title: "Menstruation",
      image: require("../assets/menstruation.png"),
      questions: [
        { question: "Quel est le cycle moyen d'une menstruation ?", options: ["14 jours", "28 jours", "40 jours"], correctAnswer: 1 },
        { question: "Quel est un symptôme courant ?", options: ["Maux de tête", "Fracture", "Perte de mémoire"], correctAnswer: 0 },
        { question: "Quelle hormone est impliquée ?", options: ["Estrogène", "Insuline", "Cortisol"], correctAnswer: 0 },
        { question: "Quelle durée est normale pour les règles ?", options: ["2-7 jours", "10-15 jours", "20 jours"], correctAnswer: 0 },
        { question: "Quels aliments peuvent soulager les crampes ?", options: ["Sucres rapides", "Légumes verts", "Fast food"], correctAnswer: 1 },
        { question: "Quel produit peut être utilisé ?", options: ["Serviette hygiénique", "Papier journal", "Serviette en cuir"], correctAnswer: 0 },
      ],
    },
    {
      id: 3,
      title: "Contraception",
      image: require("../assets/contraception.png"),
      questions: [
        { question: "Quel est un moyen de contraception ?", options: ["Pilule", "Aspirine", "Antibiotique"], correctAnswer: 0 },
        { question: "Quel moyen protège aussi des MST ?", options: ["Préservatif", "Stérilet", "Patch"], correctAnswer: 0 },
        { question: "À quel âge peut-on utiliser la contraception ?", options: ["10 ans", "15 ans", "Après la puberté"], correctAnswer: 2 },
        { question: "Quel est un effet secondaire possible ?", options: ["Nausées", "Cécité", "Fièvre"], correctAnswer: 0 },
        { question: "Quelle méthode est naturelle ?", options: ["Retrait", "Stérilet", "Patch"], correctAnswer: 0 },
        { question: "Lequel est permanent ?", options: ["Vasectomie", "Pilule", "Préservatif"], correctAnswer: 0 },
      ],
    },
    {
      id: 4,
      title: "MST",
      image: require("../assets/sti.png"),
      questions: [
        { question: "Quelle MST est causée par un virus ?", options: ["Syphilis", "Hépatite B", "Gonorrhée"], correctAnswer: 1 },
        { question: "Quel est un symptôme courant ?", options: ["Douleur", "Pertes inhabituelles", "Les deux"], correctAnswer: 2 },
        { question: "Comment prévenir les MST ?", options: ["Vaccins", "Partage d'aiguilles", "Ignorer"], correctAnswer: 0 },
        { question: "Quelle MST n'a pas de cure ?", options: ["HIV", "Syphilis", "Gonorrhée"], correctAnswer: 0 },
        { question: "Quel test est recommandé ?", options: ["Test sanguin", "Test urinaire", "Les deux"], correctAnswer: 2 },
        { question: "Quel moyen protège des MST ?", options: ["Préservatif", "Pilule", "Patch"], correctAnswer: 0 },
      ],
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [quizData, setQuizData] = useState([]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback("");

    const shuffledQuestions = category.questions.sort(() => Math.random() - 0.5).slice(0, 3);
    setQuizData(shuffledQuestions);
  };

  const handleAnswer = (selectedOptionIndex) => {
    const currentQuestion = quizData[currentQuestionIndex];

    if (selectedOptionIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
      setFeedback("Correct !");
    } else {
      setFeedback(`Incorrect. La bonne réponse est : ${currentQuestion.options[currentQuestion.correctAnswer]}`);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedback("");
    } else {
      Alert.alert("Quiz terminé", `Votre score : ${score}/${quizData.length}`);
      setSelectedCategory(null);
      setQuizData([]);
    }
  };

  if (!selectedCategory) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Explorez nos Quiz Santé</Text>
        <View style={styles.grid}>
          {quizCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.card}
              onPress={() => handleCategorySelect(category)}
            >
              <Image source={category.image} style={styles.image} />
              <Text style={styles.cardText}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{selectedCategory.title}</Text>
      <Text style={styles.question}>{currentQuestion?.question}</Text>
      <View>
        {currentQuestion?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(index)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {feedback !== "" && <Text style={styles.feedback}>{feedback}</Text>}
      <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
      <LinearGradient
                colors={["#FF7F50", "#FF1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
            >
                <Text style={styles.buttonText}>suivant</Text>
            </LinearGradient>
      </TouchableOpacity>
      <Text style={styles.footer}>
        Question {currentQuestionIndex + 1}/{quizData.length}
      </Text>
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "orange",
    marginTop: 20,
  },
  question:{
    fontSize: 12
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "49%",
    height: 240,
    backgroundColor: "#FFF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 250,
    height: 90,
    resizeMode: "contain",
  },
  cardText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    textAlign: "center",
  },
  question: {
    fontSize: 18,
    marginBottom: 15,
    color: "#444",
    textAlign: "center",
    fontWeight: 700
  },
  optionButton: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    width: "95%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  feedback: {
    marginTop: 20,
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  nextButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  gradientButton: {
    borderRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 30,
    
  },
  buttonText :{
    color:"white",
    fontWeight: 800
  }
});
