import numpy as np
from math import cos, sin
import matplotlib.pyplot as plt

class Link():
    def __init__(self,theta_offset,d,alpha,a):
        self.theta_offset = theta_offset
        self.d = d
        self.alpha = alpha
        self.a = a
    def get_transformation(self, theta):
        theta = theta+self.theta_offset
        transformation_matrix = np.array([
            [cos(theta), -sin(theta) * cos(self.alpha), sin(theta) * sin(self.alpha), self.a * cos(theta)],
            [sin(theta), cos(theta) * cos(self.alpha), -cos(theta) * sin(self.alpha), self.a * sin(theta)],
            [0, sin(self.alpha), cos(self.alpha), self.d],
            [0, 0, 0, 1]
        ])
        return transformation_matrix

class Manipulator:
    def __init__(self, links=None, q=None):
        self.links = links if links else []
        self.q = q if q else []
    
    def add_link(self, link):
        self.links.append(link)

    def forward_kinematics(self, joint_angles):
        if not self.links:
            print("No links in the manipulator.")
            return None
        
        if len(joint_angles) != len(self.links):
            print("Number of joint angles doesn't match the number of links.")
            return None
        
        transformation_matrix = np.identity(4)
        pos = []

        for i in range(len(self.links)):
            transformation_matrix = np.dot(transformation_matrix, self.links[i].get_transformation(joint_angles[i]))
            pos.append([transformation_matrix[0][3],transformation_matrix[1][3]])
        
        return transformation_matrix
    
    def plot_manipulator(self,x_joint1,y_joint1,x_joint2,y_joint2):

        # Plotting the manipulator links
        plt.figure(figsize=(6, 6))
        plt.plot([0, x_joint1], [0, y_joint1], 'bo-', label='Link 1')
        plt.plot([x_joint1, x_joint2], [y_joint1, y_joint2], 'ro-', label='Link 2')
        
        # Plotting the joints
        plt.plot(0, 0, 'go', label='Base Joint (0, 0)')
        plt.plot(x_joint1, y_joint1, 'bo', label='Joint 1')
        plt.plot(x_joint2, y_joint2, 'ro', label='End Effector')
        
        plt.xlabel('X-axis')
        plt.ylabel('Y-axis')
        plt.title('2D Manipulator with Joint Positions')
        plt.legend()
        plt.grid()
        plt.axis('equal') 
        plt.show()

