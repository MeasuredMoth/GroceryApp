import { Text, View, StyleSheet, Pressable } from "react-native";

import Entypo from '@expo/vector-icons/Entypo'; //website for vector icons: https://icons.expo.fyi/Index

type HeaderProps = {
    textHeader: string;
}

{/*Logo and name on the top left */}
export default function Header({textHeader} : HeaderProps) {

    return (
      <View style={styles.container}>
        
        <View style={styles.topRow}> 
            <View style={styles.brand}>
          
            <Entypo name="leaf" size={24} color="#2E7D4F" />
            <Text style={styles.brandName}>{textHeader}</Text>
            </View>
            
              <Pressable style={styles.profileButton}></Pressable>

        </View>

      </View> 
    )
}


const styles = StyleSheet.create({
  container: {
    gap: 6,         /*Puts a gap (vertical) between each child*/
  },
  topRow: {
    flexDirection: 'row',               /*The default is vertical*/
    justifyContent: 'space-between',    //How the content is distributed in the axis (in this case on the two opposite sides)
    alignItems: 'center',               //How the content is aligned vertically 
  },
  brand: {
    flexDirection: 'row',               //In which direction items are placed (left to right in this case)
    alignItems: 'center',               
    gap: 8,                         
  },
  brandName: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0d3332',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCEFE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0d3332',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7A72',
  },
});